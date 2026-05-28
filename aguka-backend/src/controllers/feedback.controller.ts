import { Response, NextFunction } from "express";
import { feedbackService } from "../services/feedback.service.js";
import { AuthenticatedRequest } from "../types/index.js";

export const createFeedback = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { type, category, content, rating, screenshots } = req.body;

    const feedback = await feedbackService.createFeedback(userId, {
      type,
      category,
      content,
      rating,
      screenshots,
    });

    return res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    return next(error);
  }
};

export const getFeedbackList = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page = 1, limit = 20, type, category, status, rating } = req.query;

    const result = await feedbackService.getFeedbackList({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      type: type as string,
      category: category as string,
      status: status as string,
      rating: rating ? parseInt(rating as string) : undefined,
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

export const getFeedbackById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const feedback = await feedbackService.getFeedbackById(id);

    return res.json({ success: true, data: feedback });
  } catch (error) {
    return next(error);
  }
};

export const updateFeedbackStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const feedback = await feedbackService.updateFeedbackStatus(id, {
      status,
      adminResponse,
      updatedBy: req.user!.sub,
    });

    return res.json({ success: true, data: feedback });
  } catch (error) {
    return next(error);
  }
};

export const getFeedbackAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await feedbackService.getFeedbackAnalytics({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    return res.json({ success: true, data: analytics });
  } catch (error) {
    return next(error);
  }
};

export const getUserFeedbackHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { page = 1, limit = 20 } = req.query;

    const result = await feedbackService.getUserFeedbackHistory(userId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

export const submitQuickFeedback = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { rating, comment, feature } = req.body;

    const feedback = await feedbackService.submitQuickFeedback(userId, {
      rating,
      comment,
      feature,
    });

    return res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    return next(error);
  }
};
