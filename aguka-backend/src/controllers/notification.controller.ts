import { Response, NextFunction } from "express";
import { notificationService } from "../services/notification.service.js";
import { RequestWithUser } from "../types/index.js";

export const registerDevice = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fcmToken, platform } = req.body;
    if (!fcmToken) {
      return res
        .status(400)
        .json({ success: false, error: "fcmToken is required" });
    }

    const device = await notificationService.registerDevice(
      req.user!.sub,
      fcmToken,
      platform,
    );
    return res.json({ success: true, data: device });
  } catch (error) {
    return next(error);
  }
};

export const sendTestNotification = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, body } = req.body;
    const result = await notificationService.sendToUser(
      req.user!.sub,
      title || "Test",
      body || "Test Message",
    );
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};
