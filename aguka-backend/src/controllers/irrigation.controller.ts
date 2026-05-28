import { Response, NextFunction } from "express";
import { irrigationService } from "../services/irrigation.service.js";
import { RequestWithUser } from "../types/index.js";

export const getSchedules = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const schedules = await irrigationService.getSchedules(farmerId);
    return res.json({ success: true, data: schedules });
  } catch (error) {
    return next(error);
  }
};

export const getLogs = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const logs = await irrigationService.getLogs(farmerId);
    return res.json({ success: true, data: logs });
  } catch (error) {
    return next(error);
  }
};

export const getStatus = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const status = await irrigationService.getStatus(farmerId);
    return res.json({ success: true, data: status });
  } catch (error) {
    return next(error);
  }
};

export const controlIrrigation = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const { zoneId, action } = req.body;

    if (!zoneId) {
      return res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "zoneId is required" },
      });
    }

    const result =
      action === "stop"
        ? await irrigationService.stopIrrigation(farmerId, zoneId)
        : await irrigationService.triggerIrrigation(farmerId, zoneId);

    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const createSchedule = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const schedule = await irrigationService.createSchedule(farmerId, req.body);
    return res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    return next(error);
  }
};

export const updateSchedule = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const { id } = req.params;
    const schedule = await irrigationService.updateSchedule(
      farmerId,
      id,
      req.body,
    );
    return res.json({ success: true, data: schedule });
  } catch (error) {
    return next(error);
  }
};

export const deleteSchedule = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const { id } = req.params;
    const result = await irrigationService.deleteSchedule(farmerId, id);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const triggerIrrigation = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const { zoneId } = req.body;
    const result = await irrigationService.triggerIrrigation(farmerId, zoneId);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const stopIrrigation = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const { zoneId } = req.body;
    const result = await irrigationService.stopIrrigation(farmerId, zoneId);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};
