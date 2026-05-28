import { AlertSeverity, AlertType, Language } from "@prisma/client";
import { prisma } from "../prisma.js";
import { smsService } from "./sms.service.js";
import { notificationService } from "./notification.service.js";
import { getSmsTranslation } from "../utils/i18n-sms.js";
import { logger } from "../utils/logger.js";

export class AlertService {
  /**
   * Get paginated alerts with filters
   */
  async getAlerts(filters: {
    level?: AlertSeverity;
    type?: AlertType;
    isRead?: boolean;
    farmId?: string;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 10, level, type, isRead, farmId } = filters;
    const skip = (page - 1) * limit;

    const where = {
      severity: level,
      alertType: type,
      isRead,
      farmerId: farmId,
    };

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { farmer: true },
      }),
      prisma.alert.count({ where }),
    ]);

    return {
      success: true,
      data: alerts,
      total,
      page,
      limit,
    };
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(id: string) {
    return prisma.alert.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Create and send a new alert
   * Bridges to SMS if severity is CRITICAL
   */
  async sendAlert(data: {
    farmerId: string; // This is the FarmerProfile ID
    alertType: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    recommendation?: string;
    translationKey?: string;
    translationParams?: Record<string, any>;
    createdById?: string;
  }) {
    // 1. Create the database record
    const alert = await (prisma.alert as any).create({
      data: {
        farmerId: data.farmerId,
        alertType: data.alertType,
        severity: data.severity,
        title: data.title,
        message: data.message,
        recommendation: data.recommendation,
        isRead: false,
        createdById: data.createdById,
      },
      include: {
        farmer: {
          include: {
            user: true,
          },
        },
      },
    });

    // 2. Trigger Push Notification
    const user = alert.farmer.user;
    if (user) {
      notificationService
        .sendToUser(user.id, `Aguka: ${data.title}`, data.message, {
          alertId: alert.id,
          type: data.alertType,
        })
        .catch((err) => logger.error("FCM Alert Error:", err));
    }

    // 3. Bridge to SMS for CRITICAL alerts
    if (data.severity === "critical") {
      const user = alert.farmer.user;
      if (user && user.phone) {
        let smsMessage = data.message;

        // Use localized translation if key provided
        if (data.translationKey) {
          smsMessage = getSmsTranslation(
            data.translationKey,
            user.language as Language,
            data.translationParams || {},
          );
        }

        logger.info(
          `🚨 CRITICAL ALERT Bridge to SMS: Sending to ${user.phone}`,
        );

        await smsService.sendSms(user.phone, smsMessage);

        // Mark as sent via SMS
        await prisma.alert.update({
          where: { id: alert.id },
          data: { sentViaSms: true, channel: "sms" },
        });
      }
    }

    return alert;
  }

  /**
   * Broadcast SMS to a group of farmers
   */
  async broadcastSms(data: {
    message: string;
    targetGroup: string;
    language: string;
  }) {
    const { message, targetGroup, language } = data;

    // Logic to find target users
    const users = await prisma.user.findMany({
      where: {
        role: "farmer",
        language: language as any,
        // targetGroup logic would go here (e.g. by cooperative or district)
      },
      select: { phone: true },
    });

    // Mock SMS sending logic
    logger.info(
      `Broadcasting SMS to ${users.length} users in group ${targetGroup}: ${message}`,
    );

    // Log the broadcast in a Notification table
    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.phone, // Assuming phone is unique and used as ID or link
        title: "Broadcast",
        message: message,
        status: "sent",
        channel: "sms",
      })),
    });

    return { success: true, count: users.length };
  }
}

export const alertService = new AlertService();
