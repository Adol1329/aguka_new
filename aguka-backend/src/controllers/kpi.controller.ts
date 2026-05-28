import { Request, Response, NextFunction } from "express";
import { kpiService } from "../services/kpi.service.js";
import { logger } from "../utils/logger.js";
import { RequestWithUser } from "../types/index.js";

export const getSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await kpiService.getSummary();
    return res.json({ success: true, data });
  } catch (error: any) {
    logger.error("KPI Summary Error:", error);
    return next(error);
  }
};

export const getSoilKpi = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await kpiService.getSoilKpi(req.params.id);
    if (!data) {
      return res
        .status(404)
        .json({ success: false, error: "No soil data found for this farm" });
    }
    return res.json({ success: true, data });
  } catch (error: any) {
    return next(error);
  }
};

export const getIrrigationKpi = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await kpiService.getIrrigationKpi(req.params.id);
    return res.json({ success: true, data });
  } catch (error: any) {
    return next(error);
  }
};

export const getFarmHealthScore = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await kpiService.getFarmHealthScore(req.params.id);
    return res.json({ success: true, data });
  } catch (error: any) {
    return next(error);
  }
};

export const getSensorsStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await kpiService.getSensorsStatus();
    return res.json({ success: true, data });
  } catch (error: any) {
    return next(error);
  }
};
