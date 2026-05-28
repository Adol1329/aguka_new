import { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/index.js";
import { AuthenticatedRequest } from "../types/index.js";

export const initiatePayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { amount, phoneNumber, provider, paymentType, description } =
      req.body;

    const payment = await paymentService.initiatePayment(userId, {
      amount,
      phoneNumber,
      provider,
      paymentType,
      description,
    });

    return res.status(201).json({ success: true, data: payment });
  } catch (error) {
    return next(error);
  }
};

export const confirmPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { paymentId } = req.params;
    const { otp } = req.body;

    const payment = await paymentService.confirmPayment(paymentId, otp);

    return res.json({ success: true, data: payment });
  } catch (error) {
    return next(error);
  }
};

export const getPaymentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { paymentId } = req.params;

    const payment = await paymentService.getPaymentStatus(paymentId);

    return res.json({ success: true, data: payment });
  } catch (error) {
    return next(error);
  }
};

export const getUserPayments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { page = 1, limit = 20, status } = req.query;

    const payments = await paymentService.getUserPayments(userId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status as string,
    });

    return res.json({ success: true, ...payments });
  } catch (error) {
    return next(error);
  }
};

export const handleMobileMoneyCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { provider, transactionId, status, reference } = req.body;

    const payment = await paymentService.handleCallback({
      provider,
      transactionId,
      status,
      reference,
    });

    return res.json({ success: true, data: payment });
  } catch (error) {
    return next(error);
  }
};

export const refundPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const refund = await paymentService.refundPayment(paymentId, reason);

    return res.json({ success: true, data: refund });
  } catch (error) {
    return next(error);
  }
};

export const getPaymentMethods = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const methods = await paymentService.getPaymentMethods();

    return res.json({ success: true, data: methods });
  } catch (error) {
    return next(error);
  }
};
