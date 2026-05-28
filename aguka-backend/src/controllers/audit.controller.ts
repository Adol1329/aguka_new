import { Response, NextFunction } from "express";
import { auditService } from "../services/audit.service.js";
import { RequestWithUser } from "../types/index.js";

export const getLogs = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Non-admin roles are restricted to viewing only their own audit logs
    if (req.user && req.user.role !== "super_admin" && req.user.role !== "admin") {
      req.query.userId = req.user.sub;
    }
    const result = await auditService.getLogs(req.query as any);
    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

export const getRecentActivity = async (
  _req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const activity = await auditService.getRecentActivity();
    return res.json({ success: true, data: activity });
  } catch (error) {
    return next(error);
  }
};
