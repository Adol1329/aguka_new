import { Response, NextFunction } from "express";
import { soilService } from "../services/soil.service.js";
import { RequestWithUser, UserRole } from "../types/index.js";

export const getReadings = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isElevated =
      req.user!.role === UserRole.ADMIN ||
      req.user!.role === UserRole.SUPER_ADMIN;

    // If elevated role, allow optional farmerId filter from query, otherwise default to all
    // If farmer, force their own sub as filter
    const farmerId = isElevated
      ? (req.query.farmerId as string)
      : req.user!.sub;

    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;
    const limit = parseInt(req.query.limit as string) || 100;

    const readings = await soilService.getReadings(farmerId, {
      startDate,
      endDate,
      limit,
    });

    return res.json({ success: true, data: readings });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentStatus = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const status = await soilService.getCurrentStatus(farmerId);
    return res.json({ success: true, data: status });
  } catch (error) {
    return next(error);
  }
};

export const getAlerts = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const alerts = await soilService.getSoilAlerts(farmerId);
    return res.json({ success: true, data: alerts });
  } catch (error) {
    return next(error);
  }
};

export const getRecommendations = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const recommendations = await soilService.getRecommendations(farmerId);
    return res.json({ success: true, data: recommendations });
  } catch (error) {
    return next(error);
  }
};

export const addManualReading = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const reading = await soilService.addReading(farmerId, req.body);
    return res.status(201).json({ success: true, data: reading });
  } catch (error) {
    return next(error);
  }
};
