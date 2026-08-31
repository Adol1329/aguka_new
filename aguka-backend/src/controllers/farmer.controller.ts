import { Response, NextFunction } from "express";
import { farmerService } from "../services/farmer.service.js";
import { soilService } from "../services/soil.service.js";
import { UserRole } from "../types/index.js";
import { RequestWithUser } from "../types/index.js";
import { NotFoundError } from "../middleware/error.middleware.js";
import { prisma } from "../prisma.js";

export const getProfile = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const profile = await farmerService.getProfile(req.user!.sub);
    return res.json({ success: true, data: profile });
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const profile = await farmerService.updateProfile(req.user!.sub, req.body);
    return res.json({ success: true, data: profile });
  } catch (error) {
    return next(error);
  }
};

export const createProfile = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const profile = await farmerService.createProfile(req.user!.sub, req.body);
    return res.status(201).json({ success: true, data: profile });
  } catch (error) {
    return next(error);
  }
};

export const getFarmerById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmer = await farmerService.getFarmerById(
      req.params.id,
      req.user!.sub,
      req.user!.role as UserRole,
    );
    return res.json({ success: true, data: farmer });
  } catch (error) {
    return next(error);
  }
};

export const listFarmers = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    let cooperativeId = req.query.cooperativeId as string;
    if (req.user?.role === UserRole.COOPERATIVE) {
      cooperativeId = req.user.cooperativeId as string;
    }

    const result = await farmerService.listFarmers({
      page,
      limit,
      search: req.query.search as string,
      district: req.query.district as string,
      sector: req.query.sector as string,
      cooperativeId,
      status: req.query.status as string,
    } as any);

    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const getAssignedFarmers = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await farmerService.getAssignedFarmers(req.user!.sub, {
      page,
      limit,
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

export const assignToOfficer = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await farmerService.assignToOfficer(
      req.params.id,
      req.body.extensionOfficerId,
    );
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const getSoilReadings = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;
    const limit = parseInt(req.query.limit as string) || 100;

    const readings = await soilService.getReadings(req.params.id, {
      startDate,
      endDate,
      limit,
    });

    return res.json({ success: true, data: readings });
  } catch (error) {
    return next(error);
  }
};

export const addCrop = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const crop = await farmerService.addCrop(req.user!.sub, req.body);
    return res.status(201).json({ success: true, data: crop });
  } catch (error) {
    return next(error);
  }
};

export const getCrops = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const crops = await farmerService.getCrops(req.user!.sub);
    return res.json({ success: true, data: crops });
  } catch (error) {
    return next(error);
  }
};

export const getCropCatalog = async (
  _req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const crops = await farmerService.getCropCatalog();
    return res.json({ success: true, data: crops });
  } catch (error) {
    return next(error);
  }
};

export const getFarmerCrops = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.params.id;
    // We should ideally verify if the current user has access to this farmer's data
    // but the authorizeFarmerOrRole middleware should handle basic role checks.
    // For more granular check (e.g. is this officer assigned to this farmer),
    // it could be done here or in the service.
    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: { user: true },
    });

    if (!farmer) {
      throw new NotFoundError("Farmer profile");
    }

    const crops = await farmerService.getCrops(farmer.user.id);
    return res.json({ success: true, data: crops });
  } catch (error) {
    return next(error);
  }
};

export const getCropGuidance = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const guidance = await farmerService.getCropGuidance(
      req.user!.sub,
      req.params.cropId,
    );
    return res.json({ success: true, data: guidance });
  } catch (error) {
    return next(error);
  }
};

export const verifyFarmer = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.params.id;
    const result = await farmerService.verifyFarmer(farmerId, req.user!.sub);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const bulkVerifyFarmers = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerIds = req.body.ids;
    if (!farmerIds || !Array.isArray(farmerIds) || farmerIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid farmer IDs provided" });
    }

    const result = await farmerService.bulkVerifyFarmers(
      farmerIds,
      req.user!.sub,
    );
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const getFarmGuidance = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;

    const profile = await prisma.farmerProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError("Farmer profile");
    }

    const crops = await farmerService.getCrops(userId);
    const cropsWithGuidance = await Promise.all(
      crops.map(async (crop: any) => {
        const guidance = await farmerService.getCropGuidance(userId, crop.id);
        return { crop, guidance };
      }),
    );

    const livestock = await prisma.livestock.findMany({
      where: { farmerId: profile.id },
    });

    return res.json({
      success: true,
      data: {
        crops: cropsWithGuidance,
        livestock,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyDistributions = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;

    const distributions = await prisma.resourceDistribution.findMany({
      where: { farmerId: userId },
      include: {
        resource: true,
      },
      orderBy: { distributedAt: "desc" },
    });

    return res.json({ success: true, data: distributions });
  } catch (error) {
    return next(error);
  }
};
