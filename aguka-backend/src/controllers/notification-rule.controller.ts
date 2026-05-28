import { Response, NextFunction } from "express";
import { notificationRuleService } from "../services/notification-rule.service.js";
import { RequestWithUser } from "../types/index.js";

export const getRules = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rules = await notificationRuleService.getRules(req.user!.sub);
    return res.json({ success: true, data: rules });
  } catch (error) {
    return next(error);
  }
};

export const createRule = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, description, type, channels, conditions } = req.body;

    if (!name || !type || !channels) {
      return res.status(400).json({
        success: false,
        error: "Name, type, and channels are required",
      });
    }

    const rule = await notificationRuleService.createRule(req.user!.sub, {
      name,
      description,
      type,
      channels,
      conditions,
    });

    return res.status(201).json({ success: true, data: rule });
  } catch (error) {
    return next(error);
  }
};

export const updateRule = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, description, enabled, channels, conditions } = req.body;

    const rule = await notificationRuleService.updateRule(
      req.params.id,
      req.user!.sub,
      { name, description, enabled, channels, conditions },
    );

    return res.json({ success: true, data: rule });
  } catch (error) {
    return next(error);
  }
};

export const deleteRule = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    await notificationRuleService.deleteRule(req.params.id, req.user!.sub);
    return res.json({ success: true, message: "Rule deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

export const getNotifications = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const isRead =
      req.query.isRead === "true"
        ? true
        : req.query.isRead === "false"
          ? false
          : undefined;
    const type = req.query.type as string;

    const result = await notificationRuleService.getNotifications(
      req.user!.sub,
      {
        page,
        limit,
        isRead,
        type,
      },
    );

    return res.json({
      success: true,
      data: result.notifications,
      meta: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

export const markAsRead = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        error: "notificationIds array is required",
      });
    }

    await notificationRuleService.markAsRead(notificationIds, req.user!.sub);
    return res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    return next(error);
  }
};

export const markAllAsRead = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    await notificationRuleService.markAllAsRead(req.user!.sub);
    return res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    return next(error);
  }
};

export const getUnreadCount = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const count = await notificationRuleService.getUnreadCount(req.user!.sub);
    return res.json({ success: true, data: { count } });
  } catch (error) {
    return next(error);
  }
};
