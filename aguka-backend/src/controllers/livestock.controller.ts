import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../types/index.js";
import { auditService } from "../services/audit.service.js";
import { prisma } from "../prisma.js";

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
    const { animalType, breed, healthStatus } = req.query;
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
        nutrition: getNutritionGuidance(animalType as string, breed as string),
        health: getHealthGuidance(healthStatus as string),
        housing: getHousingGuidance(animalType as string),
        breeding: getBreedingGuidance(animalType as string, breed as string),
      },
      specific: livestock.map((animal) => ({
        id: animal.id,
        animalType: animal.animalType,
        breed: animal.breed,
        weightKg: animal.weightKg,
        healthStatus: animal.healthStatus,
        lastVaccinationDate: animal.lastVaccinationDate,
        nextVaccinationDue: animal.nextVaccinationDue,
        recommendations: getAnimalSpecificRecommendations(animal),
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
export const addLivestock = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user?.sub;
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
      userId: farmerId,
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
    const farmerId = req.user?.sub;

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
        purchaseDate: purchaseDate ? new Date(purchaseDate) : livestock.purchaseDate,
        weightKg: weightKg !== undefined ? parseFloat(weightKg) : livestock.weightKg,
        healthStatus: healthStatus || livestock.healthStatus,
        feedingRegime: feedingRegime ?? livestock.feedingRegime,
        notes: notes ?? livestock.notes,
      },
    });

    // Log audit
    await auditService.logWithSnapshot({
      userId: farmerId,
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
    const farmerId = req.user?.sub;

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
      userId: farmerId,
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
    const farmerId = req.user?.sub;

    if (!farmerId) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const [total, byType, byHealthStatus, vaccinationStatus] = await Promise.all([
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
          byHealthStatus.map((h) => [h.healthStatus, h._count])
        ),
        needsVaccination: vaccinationStatus,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Helper functions for guidance generation
function getNutritionGuidance(animalType: string, _breed: string): string {
  const guidanceMap: Record<string, string> = {
    cow: "Provide balanced diet with roughage, concentrates, minerals, and vitamins. Lactating cows need additional protein and calcium.",
    goat: "High-quality hay, fresh water, and mineral supplements. Pregnant/lactating does need extra nutrition.",
    sheep: "Good quality pasture, hay, and supplements. Avoid overfeeding grains to prevent digestive issues.",
    chicken: "Commercial feed appropriate for age and purpose (layers/broilers), fresh water, grit, and oyster shell for layers.",
    pig: "Balanced commercial diet with adequate protein, energy, vitamins, and minerals. Clean water always available.",
    rabbit: "Unlimited hay, fresh vegetables, limited pellets, and fresh water. Avoid sudden diet changes.",
  };

  return guidanceMap[animalType.toLowerCase()] || "Consult with a veterinarian for species-specific nutrition advice.";
}

function getHealthGuidance(healthStatus: string): string {
  const guidanceMap: Record<string, string> = {
    healthy: "Maintain regular check-ups, vaccinations, and parasite control. Monitor for any changes in behavior or appetite.",
    sick: "Isolate the animal, contact veterinarian immediately, and provide supportive care as advised.",
    recovering: "Follow veterinary instructions closely, provide easy access to food/water, and monitor progress regularly.",
    pregnant: "Increase nutrition gradually, provide clean dry housing, and prepare for birthing process.",
    lactating: "High-quality nutrition and plenty of water. Monitor for mastitis and ensure proper milk let-down.",
  };

  return guidanceMap[healthStatus.toLowerCase()] || "Consult with a veterinarian for health-specific guidance.";
}

function getHousingGuidance(animalType: string): string {
  const guidanceMap: Record<string, string> = {
    cow: "Clean, dry, well-ventilated housing with adequate space (minimum 3.5 sqm per cow). Provide comfortable bedding.",
    goat: "Well-ventilated shelter with dry bedding. Protect from extreme weather and predators. Minimum 1.5 sqm per goat.",
    sheep: "Draft-free, dry housing with good ventilation. Clean bedding and adequate space (1.4 sqm per sheep).",
    chicken: "Secure coop with nesting boxes, perches, and run. Provide 0.37 sqm per bird inside coop, 0.93 sqm in run.",
    pig: "Clean, dry pen with proper drainage. Temperature control important. Minimum 0.6 sqm per pig for growing animals.",
    rabbit: "Weather-protected hutch with solid floor, adequate ventilation, and protection from predators. Minimum 0.56 sqm per rabbit.",
  };

  return guidanceMap[animalType.toLowerCase()] || "Provide clean, dry, predator-proof shelter appropriate for the species.";
}

function getBreedingGuidance(animalType: string, _breed: string): string {
  const guidanceMap: Record<string, string> = {
    cow: "Breed heifers at 15-18 months or when they reach 60% of mature weight. Observe for signs of heat every 21 days.",
    goat: "Does can breed at 7-10 months. Estrus cycle is 17-25 days. Buck-to-do ratio should be 1:25-30.",
    sheep: "Ewes bred at 7-8 months or 45kg weight. Estrus cycle 14-19 days. Ram-to-ewe ratio 1:25-50 for mature rams.",
    chicken: "Roosters mature at 4-5 months. Hens start laying at 5-6 months. Provide nesting boxes and collect eggs daily.",
    pig: "Gilts bred at 7-8 months or 100-120kg. Estrus cycle 21 days. Boar-to-sow ratio 1:10-20 for natural mating.",
    rabbit: "Does bred at 5-6 months. Estrus cycle every 4 days. Buck-to-do ratio 1:10 for optimal breeding.",
  };

  return guidanceMap[animalType.toLowerCase()] || "Consult with a veterinarian or extension officer for breeding guidance.";
}

function getAnimalSpecificRecommendations(animal: any): string[] {
  const recommendations = [];

  // Weight-based recommendations
  if (animal.weightKg) {
    if (animal.animalType.toLowerCase() === "cow" && animal.weightKg < 250) {
      recommendations.push("Consider supplemental feeding to reach optimal weight for breeding age");
    }
    if (animal.animalType.toLowerCase() === "goat" && animal.weightKg < 20) {
      recommendations.push("Monitor growth and consider creep feeding if young animal");
    }
  }

  // Health status recommendations
  if (animal.healthStatus !== "healthy") {
    recommendations.push("Consult veterinarian for health assessment and treatment plan");
  }

  // Vaccination recommendations
  const today = new Date();
  if (animal.lastVaccinationDate) {
    const lastVacc = new Date(animal.lastVaccinationDate);
    const monthsSince = (today.getTime() - lastVacc.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSince > 6) {
      recommendations.push("Vaccination may be due - consult with veterinarian");
    }
  }

  if (animal.nextVaccinationDue) {
    const nextVacc = new Date(animal.nextVaccinationDue);
    if (nextVacc <= today) {
      recommendations.push("Vaccination is overdue - schedule with veterinarian immediately");
    } else {
      const daysUntil = (nextVacc.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntil <= 7) {
        recommendations.push(`Vaccination due in ${Math.ceil(daysUntil)} days - plan accordingly`);
      }
    }
  }

  // Default recommendations if none specific
  if (recommendations.length === 0) {
    recommendations.push("Maintain regular health checks and vaccinations");
    recommendations.push("Provide clean water and appropriate nutrition daily");
    recommendations.push("Monitor for changes in behavior, appetite, or appearance");
  }

  return recommendations;
}

export default {
  getLivestockGuidance,
  getMyLivestock,
  addLivestock,
  updateLivestock,
  removeLivestock,
  getLivestockStats,
};
