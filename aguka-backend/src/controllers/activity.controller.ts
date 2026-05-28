import { Response, NextFunction } from "express";
import { activityService } from "../services/activity.service.js";
import { RequestWithUser } from "../types/index.js";
import { prisma } from "../prisma.js";

export const getFarmerActivities = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.params.farmerId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const cropId = req.query.cropId as string;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    const result = await activityService.getFarmerActivities(farmerId, {
      page,
      limit,
      cropId,
      startDate,
      endDate,
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentFarmerActivities = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const cropId = req.query.cropId as string;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    const farmerProfile = await prisma.farmerProfile.findFirst({
      where: { userId: req.user!.sub },
    });

    if (!farmerProfile) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Farmer profile not found" },
      });
    }

    const result = await activityService.getFarmerActivities(farmerProfile.id, {
      page,
      limit,
      cropId,
      startDate,
      endDate,
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

export const getActivityById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const activity = await activityService.getActivityById(
      req.params.id,
      req.user!.sub,
    );
    return res.json({ success: true, data: activity });
  } catch (error) {
    return next(error);
  }
};

export const getActivityTypes = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const types = await activityService.getActivityTypes(req.user!.sub);
    return res.json({ success: true, data: types });
  } catch (error) {
    return next(error);
  }
};

export const getActivities = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const cropId = req.query.cropId as string;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    // For cooperative admins/officers, they might want to see activities for their cooperative/farmers
    // For now, we'll implement basic filtering
    const result = await activityService.getActivities({
      page,
      limit,
      cropId,
      startDate,
      endDate,
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

export const createActivity = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const activity = await activityService.createActivity(
      req.user!.sub,
      req.body,
    );
    return res.status(201).json({ success: true, data: activity });
  } catch (error) {
    return next(error);
  }
};

export const updateActivity = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const activity = await activityService.updateActivity(
      req.params.id,
      req.user!.sub,
      req.body,
    );
    return res.json({ success: true, data: activity });
  } catch (error) {
    return next(error);
  }
};

export const deleteActivity = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    await activityService.deleteActivity(req.params.id, req.user!.sub);
    return res.json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
