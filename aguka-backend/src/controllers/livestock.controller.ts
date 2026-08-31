import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../types/index.js";
import { auditService } from "../services/audit.service.js";
import { prisma } from "../prisma.js";
import {
  normalizeGuidanceLang,
  getNutritionGuidance,
  getHousingGuidance,
  getBreedingGuidance,
  getHealthGuidance,
  getAnimalSpecificRecommendations,
} from "../utils/i18n-guidance.js";

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Get livestock guidance and recommendations
 */
export const getLivestockGuidance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { animalType, breed, healthStatus, lang } = req.query;
    const guidanceLang = normalizeGuidanceLang(lang);
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const farmerProfile = await prisma.farmerProfile.findFirst({
      where: { userId },
    });

    if (!farmerProfile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Farmer profile not found",
        },
      });
    }

    // Get farmer's livestock for personalized guidance
    const livestock = await prisma.livestock.findMany({
      where: {
        farmerId: farmerProfile.id,
        ...(animalType && { animalType: animalType as string }),
        ...(breed && { breed: breed as string }),
      },
      include: {
        farmer: true,
      },
    });

    // Generate guidance based on livestock data and query parameters
    const guidance = {
      general: {
        nutrition: animalType
          ? getNutritionGuidance(animalType as string, guidanceLang)
          : undefined,
        health: healthStatus
          ? getHealthGuidance(healthStatus as string, guidanceLang)
          : undefined,
        housing: animalType
          ? getHousingGuidance(animalType as string, guidanceLang)
          : undefined,
        breeding: animalType
          ? getBreedingGuidance(animalType as string, guidanceLang)
          : undefined,
      },
      specific: livestock.map((animal) => ({
        id: animal.id,
        animalType: animal.animalType,
        breed: animal.breed,
        weightKg: animal.weightKg,
        healthStatus: animal.healthStatus,
        lastVaccinationDate: animal.lastVaccinationDate,
        nextVaccinationDue: animal.nextVaccinationDue,
        nutrition: getNutritionGuidance(animal.animalType, guidanceLang),
        housing: getHousingGuidance(animal.animalType, guidanceLang),
        breeding: getBreedingGuidance(animal.animalType, guidanceLang),
        health: getHealthGuidance(animal.healthStatus, guidanceLang),
        recommendations: getAnimalSpecificRecommendations(animal, guidanceLang),
      })),
    };

    return res.json({
      success: true,
      data: guidance,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get farmer's livestock list
 */
export const getMyLivestock = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const farmerProfile = await prisma.farmerProfile.findFirst({
      where: { userId },
    });

    if (!farmerProfile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Farmer profile not found",
        },
      });
    }

    const livestock = await prisma.livestock.findMany({
      where: { farmerId: farmerProfile.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: livestock,
    });
  } catch (error) {
    return next(error);
  }
};

export const getLivestockItemGuidance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.sub;
    const { livestockId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const farmerProfile = await prisma.farmerProfile.findFirst({
      where: { userId },
    });

    if (!farmerProfile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Farmer profile not found",
        },
      });
    }

    const livestock = await prisma.livestock.findFirst({
      where: { id: livestockId, farmerId: farmerProfile.id },
    });

    if (!livestock) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Livestock not found",
        },
      });
    }

    return res.json({
      success: true,
      data: {
        livestock,
        healthStatus: livestock.healthStatus,
        feedingRegime: livestock.feedingRegime,
        lastVaccinationDate: livestock.lastVaccinationDate,
        nextVaccinationDue: livestock.nextVaccinationDue,
        notes: livestock.notes,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Add new livestock record
 */
async function resolveFarmerId(
  user: JwtPayload | undefined,
): Promise<string | undefined> {
  if (!user) return undefined;
  if (user.farmerId) return user.farmerId;
  if (user.sub) {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    return profile?.id;
  }
  return undefined;
}

export const addLivestock = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = await resolveFarmerId(req.user);
    const {
      animalType,
      breed,
      tagNumber,
      birthDate,
      purchaseDate,
      weightKg,
      healthStatus,
      feedingRegime,
      notes,
    } = req.body;

    if (!farmerId) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    // Check if tag number already exists
    if (tagNumber) {
      const existing = await prisma.livestock.findFirst({
        where: { tagNumber },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: {
            code: "DUPLICATE",
            message: "Livestock with this tag number already exists",
          },
        });
      }
    }

    const livestock = await prisma.livestock.create({
      data: {
        farmerId,
        animalType,
        breed,
        tagNumber: tagNumber || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        healthStatus: healthStatus || "healthy",
        feedingRegime: feedingRegime || null,
        notes: notes || null,
      },
    });

    // Log audit
    await auditService.logWithSnapshot({
      userId: req.user!.sub,
      action: "ADD_LIVESTOCK",
      module: "LIVESTOCK_MANAGEMENT",
      resourceId: livestock.id,
      before: null,
      after: livestock,
    });

    return res.status(201).json({
      success: true,
      data: livestock,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update livestock record
 */
export const updateLivestock = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { livestockId } = req.params;
    const farmerId = await resolveFarmerId(req.user);

    if (!farmerId) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const livestock = await prisma.livestock.findFirst({
      where: { id: livestockId, farmerId },
    });

    if (!livestock) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Livestock not found or access denied",
        },
      });
    }

    const {
      animalType,
      breed,
      tagNumber,
      birthDate,
      purchaseDate,
      weightKg,
      healthStatus,
      feedingRegime,
      notes,
    } = req.body;

    // Check if tag number already exists for another livestock
    if (tagNumber && tagNumber !== livestock.tagNumber) {
      const existing = await prisma.livestock.findFirst({
        where: { tagNumber, NOT: { id: livestockId } },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: {
            code: "DUPLICATE",
            message: "Livestock with this tag number already exists",
          },
        });
      }
    }

    const updatedLivestock = await prisma.livestock.update({
      where: { id: livestockId },
      data: {
        animalType: animalType || livestock.animalType,
        breed: breed || livestock.breed,
        tagNumber: tagNumber ?? livestock.tagNumber,
        birthDate: birthDate ? new Date(birthDate) : livestock.birthDate,
        purchaseDate: purchaseDate
          ? new Date(purchaseDate)
          : livestock.purchaseDate,
        weightKg:
          weightKg !== undefined ? parseFloat(weightKg) : livestock.weightKg,
        healthStatus: healthStatus || livestock.healthStatus,
        feedingRegime: feedingRegime ?? livestock.feedingRegime,
        notes: notes ?? livestock.notes,
      },
    });

    // Log audit
    await auditService.logWithSnapshot({
      userId: req.user!.sub,
      action: "UPDATE_LIVESTOCK",
      module: "LIVESTOCK_MANAGEMENT",
      resourceId: livestockId,
      before: livestock,
      after: updatedLivestock,
    });

    return res.json({
      success: true,
      data: updatedLivestock,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Remove livestock record
 */
export const removeLivestock = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { livestockId } = req.params;
    const farmerId = await resolveFarmerId(req.user);

    if (!farmerId) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const livestock = await prisma.livestock.findFirst({
      where: { id: livestockId, farmerId },
    });

    if (!livestock) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Livestock not found or access denied",
        },
      });
    }

    // Log audit before deletion
    await auditService.logWithSnapshot({
      userId: req.user!.sub,
      action: "REMOVE_LIVESTOCK",
      module: "LIVESTOCK_MANAGEMENT",
      resourceId: livestockId,
      before: livestock,
      after: null,
    });

    await prisma.livestock.delete({
      where: { id: livestockId },
    });

    return res.json({
      success: true,
      message: "Livestock removed successfully",
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get livestock statistics for dashboard
 */
export const getLivestockStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = await resolveFarmerId(req.user);

    if (!farmerId) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const [total, byType, byHealthStatus, vaccinationStatus] =
      await Promise.all([
        prisma.livestock.count({ where: { farmerId } }),
        prisma.livestock.groupBy({
          by: ["animalType"],
          where: { farmerId },
          _count: true,
        }),
        prisma.livestock.groupBy({
          by: ["healthStatus"],
          where: { farmerId },
          _count: true,
        }),
        prisma.livestock.count({
          where: {
            farmerId,
            OR: [
              { lastVaccinationDate: { lt: new Date() } },
              { nextVaccinationDue: { lt: new Date() } },
            ],
          },
        }),
      ]);

    return res.json({
      success: true,
      data: {
        total,
        byType: Object.fromEntries(byType.map((t) => [t.animalType, t._count])),
        byHealthStatus: Object.fromEntries(
          byHealthStatus.map((h) => [h.healthStatus, h._count]),
        ),
        needsVaccination: vaccinationStatus,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getLivestockGuidance,
  getMyLivestock,
  addLivestock,
  updateLivestock,
  removeLivestock,
  getLivestockStats,
};
