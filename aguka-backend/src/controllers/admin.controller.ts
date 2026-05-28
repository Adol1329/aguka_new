import { Request, Response, NextFunction } from "express";
import { adminService } from "../services/admin.service.js";
import { prisma } from "../prisma.js";
import { alertService } from "../services/alert.service.js";
import { supportService } from "../services/support.service.js";
import { sensorService } from "../services/sensor.service.js";
import { reportService } from "../services/report.service.js";
import { userService } from "../services/user.service.js";
import { RequestWithUser } from "../types/index.js";

export const getKpiSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await adminService.getKpiSummary();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getFarmerGrowth = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await adminService.getFarmerGrowth();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getAlertsByType = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await adminService.getAlertsByType();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getSoilHealthDistribution = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await adminService.getSoilHealthDistribution();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getSensorStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await sensorService.getSensorStatus();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getFarmSoilHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    const data = await sensorService.getSoilHistory(
      id,
      from as string,
      to as string,
    );
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getFarmReports = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { cooperativeId, from, to } = req.query;
    const data = await reportService.getFarmReports({
      cooperativeId: cooperativeId as string,
      from: from as string,
      to: to as string,
    });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getAlerts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await alertService.getAlerts(req.query as any);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
};

export const resolveAlert = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await alertService.resolveAlert(req.params.id);
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const broadcastSms = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await alertService.broadcastSms(req.body);
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getSupportTickets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await supportService.getTickets(req.query as any);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
};

export const getSupportStats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await supportService.getStats();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const replyToTicket = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await supportService.replyToTicket(
      req.params.id,
      req.body.reply,
    );
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const updateTicketStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await supportService.updateStatus(
      req.params.id,
      req.body.status,
    );
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getPendingUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await prisma.user.findMany({
      where: { status: 'pending_verification' },
      select: {
        id:        true,
        phone:     true,
        email:     true,
        role:      true,
        createdAt: true,
        farmerProfile: {
          select: { fullName: true, district: true }
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const approveUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminId = (req as any).userId || (req as any).user?.sub;
    const data = await adminService.approveUser(req.params.id, adminId);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
};

export const rejectUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    const adminId = (req as any).userId || (req as any).user?.sub;
    const data = await adminService.rejectUser(req.params.id, adminId, reason);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
};

export const resetUserPassword = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminId = req.user!.sub;
    const { userId } = req.params;
    const result = await userService.adminResetPassword(adminId, userId);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};
