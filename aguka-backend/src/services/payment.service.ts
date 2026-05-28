import { auditService } from "./audit.service.js";
import { logger } from "../utils/logger.js";
import { prisma } from "../prisma.js";

interface PaymentRequest {
  amount: number;
  phoneNumber: string;
  provider: "mtn" | "airtel" | "tigomoney";
  paymentType:
    | "premium_subscription"
    | "sensor_purchase"
    | "service_fee"
    | "market_listing";
  description?: string;
}

interface MobileMoneyCallback {
  provider: string;
  transactionId: string;
  status: "success" | "failed" | "pending";
  reference: string;
}

export class PaymentService {
  async initiatePayment(userId: string, data: PaymentRequest) {
    try {
      // Validate phone number format for Rwanda
      const sanitizedPhone = this.sanitizePhoneNumber(data.phoneNumber);

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          userId,
          amount: data.amount,
          currency: "RWF",
          provider: data.provider,
          phoneNumber: sanitizedPhone,
          paymentType: data.paymentType,
          description: data.description,
          status: "pending",
          reference: this.generateReference(),
        },
      });

      // Initiate mobile money payment based on provider
      let mobileMoneyResponse;

      switch (data.provider) {
        case "mtn":
          mobileMoneyResponse = await this.initiateMTNPayment(
            data,
            payment.reference,
          );
          break;
        case "airtel":
          mobileMoneyResponse = await this.initiateAirtelPayment(
            data,
            payment.reference,
          );
          break;
        case "tigomoney":
          mobileMoneyResponse = await this.initiateTigoPayment(
            data,
            payment.reference,
          );
          break;
        default:
          throw new Error("Unsupported payment provider");
      }

      // Update payment with mobile money transaction details
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          transactionId: mobileMoneyResponse.transactionId,
          externalReference: mobileMoneyResponse.externalReference,
          status:
            mobileMoneyResponse.status === "success" ? "processing" : "pending",
        },
      });

      // Log audit
      await auditService.logAction({
        userId,
        action: "INITIATE_PAYMENT",
        module: "PAYMENT",
        resourceId: payment.id,
        details: `Payment of ${data.amount} RWF initiated via ${data.provider}`,
      });

      return {
        id: payment.id,
        reference: payment.reference,
        amount: payment.amount,
        status: payment.status,
        transactionId: mobileMoneyResponse.transactionId,
        provider: data.provider,
        instructions: mobileMoneyResponse.instructions,
      };
    } catch (error) {
      logger.error("Error initiating payment:", error);
      throw error;
    }
  }

  async confirmPayment(paymentId: string, _otp?: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status !== "pending" && payment.status !== "processing") {
        throw new Error("Payment cannot be confirmed");
      }

      // Check payment status with provider
      const status = await this.checkPaymentStatus(
        payment.provider,
        payment.transactionId!,
      );

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: status.status,
          completedAt: status.status === "completed" ? new Date() : null,
          failureReason: status.status === "failed" ? status.reason : null,
        },
      });

      // If payment completed, activate service
      if (status.status === "completed") {
        await this.activateService(payment);

        // Log audit
        await auditService.logAction({
          userId: payment.userId,
          action: "PAYMENT_COMPLETED",
          module: "PAYMENT",
          resourceId: payment.id,
          details: `Payment of ${payment.amount} RWF completed`,
        });
      }

      return updatedPayment;
    } catch (error) {
      logger.error("Error confirming payment:", error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      // If payment is still pending, check with provider
      if (payment.status === "pending" || payment.status === "processing") {
        const providerStatus = await this.checkPaymentStatus(
          payment.provider,
          payment.transactionId!,
        );

        if (providerStatus.status !== payment.status) {
          // Update status if changed
          await prisma.payment.update({
            where: { id: paymentId },
            data: {
              status: providerStatus.status,
              completedAt:
                providerStatus.status === "completed" ? new Date() : null,
              failureReason:
                providerStatus.status === "failed"
                  ? providerStatus.reason
                  : null,
            },
          });

          payment.status = providerStatus.status;
        }
      }

      return payment;
    } catch (error) {
      logger.error("Error getting payment status:", error);
      throw error;
    }
  }

  async getUserPayments(
    userId: string,
    params: { page: number; limit: number; status?: string },
  ) {
    try {
      const { page, limit, status } = params;
      const skip = (page - 1) * limit;

      const where: any = { userId };
      if (status) {
        where.status = status;
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.payment.count({ where }),
      ]);

      return {
        data: payments,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error getting user payments:", error);
      throw error;
    }
  }

  async handleCallback(callback: MobileMoneyCallback) {
    try {
      // Find payment by external reference
      const payment = await prisma.payment.findFirst({
        where: { externalReference: callback.reference },
      });

      if (!payment) {
        logger.warn(`Payment not found for reference: ${callback.reference}`);
        throw new Error("Payment not found");
      }

      // Update payment status based on callback
      const status =
        callback.status === "success"
          ? "completed"
          : callback.status === "failed"
            ? "failed"
            : "pending";

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status,
          completedAt: status === "completed" ? new Date() : null,
          failureReason:
            status === "failed" ? "Payment failed via callback" : null,
        },
      });

      // If payment completed, activate service
      if (status === "completed") {
        await this.activateService(payment);
      }

      logger.info(`Payment ${payment.id} updated via callback: ${status}`);
      return updatedPayment;
    } catch (error) {
      logger.error("Error handling payment callback:", error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, reason: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status !== "completed") {
        throw new Error("Only completed payments can be refunded");
      }

      // Initiate refund with provider
      const refundResponse = await this.initiateRefund(payment);

      // Create refund record
      const refund = await prisma.refund.create({
        data: {
          paymentId,
          amount: payment.amount,
          reason,
          status: refundResponse.status,
          refundTransactionId: refundResponse.transactionId,
        },
      });

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "refunded" },
      });

      // Log audit
      await auditService.logAction({
        userId: payment.userId,
        action: "PAYMENT_REFUNDED",
        module: "PAYMENT",
        resourceId: paymentId,
        details: `Payment of ${payment.amount} RWF refunded: ${reason}`,
      });

      return refund;
    } catch (error) {
      logger.error("Error refunding payment:", error);
      throw error;
    }
  }

  async getPaymentMethods() {
    return [
      {
        id: "mtn",
        name: "MTN Mobile Money",
        description: "Pay using MTN Mobile Money",
        icon: "mtn-icon",
        supported: true,
        fees: 0, // No fees for farmers
      },
      {
        id: "airtel",
        name: "Airtel Money",
        description: "Pay using Airtel Money",
        icon: "airtel-icon",
        supported: true,
        fees: 0,
      },
      {
        id: "tigomoney",
        name: "Tigo Money",
        description: "Pay using Tigo Money",
        icon: "tigo-icon",
        supported: true,
        fees: 0,
      },
    ];
  }

  private sanitizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, "");

    // Handle Rwanda phone numbers
    if (digits.startsWith("250")) {
      digits = digits.substring(3);
    } else if (digits.startsWith("0")) {
      digits = digits.substring(1);
    }

    // Ensure it starts with 7 (Rwanda mobile numbers)
    if (!digits.startsWith("7")) {
      throw new Error("Invalid Rwanda phone number");
    }

    return `250${digits}`;
  }

  private generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `AGUKA${timestamp}${random}`.toUpperCase();
  }

  private async initiateMTNPayment(data: PaymentRequest, reference: string) {
    try {
      // Integration with MTN Mobile Money API
      // This is a mock implementation - replace with actual MTN API integration

      const response = {
        transactionId: `MTN${Date.now()}`,
        externalReference: reference,
        status: "success",
        instructions: {
          message: "Dial *182*8*1# to confirm payment",
          ussdCode: "*182*8*1#",
          amount: data.amount,
          reference: reference,
        },
      };

      logger.info(`MTN payment initiated: ${reference}`);
      return response;
    } catch (error) {
      logger.error("Error initiating MTN payment:", error);
      throw new Error("Failed to initiate MTN payment");
    }
  }

  private async initiateAirtelPayment(data: PaymentRequest, reference: string) {
    try {
      // Integration with Airtel Money API
      const response = {
        transactionId: `AIRTEL${Date.now()}`,
        externalReference: reference,
        status: "success",
        instructions: {
          message: "Dial *182*7*1# to confirm payment",
          ussdCode: "*182*7*1#",
          amount: data.amount,
          reference: reference,
        },
      };

      logger.info(`Airtel payment initiated: ${reference}`);
      return response;
    } catch (error) {
      logger.error("Error initiating Airtel payment:", error);
      throw new Error("Failed to initiate Airtel payment");
    }
  }

  private async initiateTigoPayment(data: PaymentRequest, reference: string) {
    try {
      // Integration with Tigo Money API
      const response = {
        transactionId: `TIGO${Date.now()}`,
        externalReference: reference,
        status: "success",
        instructions: {
          message: "Dial *182*5*1# to confirm payment",
          ussdCode: "*182*5*1#",
          amount: data.amount,
          reference: reference,
        },
      };

      logger.info(`Tigo payment initiated: ${reference}`);
      return response;
    } catch (error) {
      logger.error("Error initiating Tigo payment:", error);
      throw new Error("Failed to initiate Tigo payment");
    }
  }

  private async checkPaymentStatus(_provider: string, transactionId: string) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { transactionId },
      });

      if (!payment) {
        return { status: "pending", reason: undefined };
      }

      return {
        status:
          payment.status === "completed"
            ? "completed"
            : payment.status === "failed"
              ? "failed"
              : "pending",
        reason: payment.failureReason || undefined,
      };
    } catch (error) {
      logger.error("Error checking payment status:", error);
      return { status: "pending" };
    }
  }

  private async initiateRefund(_payment: any) {
    try {
      // Mock refund implementation
      return {
        transactionId: `REFUND${Date.now()}`,
        status: "processing",
      };
    } catch (error) {
      logger.error("Error initiating refund:", error);
      throw new Error("Failed to initiate refund");
    }
  }

  private async activateService(payment: any) {
    try {
      // Activate service based on payment type
      switch (payment.paymentType) {
        case "premium_subscription":
          await this.activatePremiumSubscription(payment.userId);
          break;
        case "sensor_purchase":
          await this.activateSensorService(payment.userId);
          break;
        case "service_fee":
          await this.activateServiceAccess(payment.userId);
          break;
        case "market_listing":
          await this.activateMarketListing(payment.userId);
          break;
      }
    } catch (error) {
      logger.error("Error activating service:", error);
    }
  }

  private async activatePremiumSubscription(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionType: "premium",
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }, // 30 days
    });
  }

  private async activateSensorService(userId: string) {
    // Update user's sensor access
    await prisma.user.update({
      where: { id: userId },
      data: { hasSensorAccess: true },
    });
  }

  private async activateServiceAccess(userId: string) {
    // Grant temporary service access
    await prisma.user.update({
      where: { id: userId },
      data: {
        serviceAccessExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }, // 7 days
    });
  }

  private async activateMarketListing(userId: string) {
    // Grant market listing access
    await prisma.user.update({
      where: { id: userId },
      data: { hasMarketAccess: true },
    });
  }
}

export const paymentService = new PaymentService();
