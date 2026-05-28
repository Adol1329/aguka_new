import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../middleware/error.middleware.js";
import { PaginationParams, FilterParams, UserRole } from "../types/index.js";
import { prisma } from "../prisma.js";
import { WaterSource, IrrigationType, AccessChannel } from "@prisma/client";

export class FarmerService {
  async getProfile(userId: string) {
    const profile = await prisma.farmerProfile.findFirst({
      where: { userId },
      include: {
        user: true,
        cooperative: true,
        sensors: true,
        farmerCrops: { include: { crop: true } },
      },
    });

    if (!profile) {
      throw new NotFoundError("Farmer profile");
    }

    return this.formatProfile(profile);
  }

  async updateProfile(userId: string, data: Record<string, unknown>) {
    const profile = await prisma.farmerProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError("Farmer profile");
    }

    const updated = await prisma.farmerProfile.update({
      where: { userId },
      data: {
        fullName:
          (data.fullName as string) !== undefined
            ? (data.fullName as string)
            : undefined,
        farmName:
          (data.farmName as string) !== undefined
            ? (data.farmName as string)
            : undefined,
        location:
          (data.location as string) !== undefined
            ? (data.location as string)
            : undefined,
        district:
          (data.district as string) !== undefined
            ? (data.district as string)
            : undefined,
        sector:
          (data.sector as string) !== undefined
            ? (data.sector as string)
            : undefined,
        cell:
          (data.cell as string) !== undefined
            ? (data.cell as string)
            : undefined,
        cellCode:
          (data.cellCode as string) !== undefined
            ? (data.cellCode as string)
            : undefined,
        sectorCode:
          (data.sectorCode as string) !== undefined
            ? (data.sectorCode as string)
            : undefined,
        districtCode:
          (data.districtCode as string) !== undefined
            ? (data.districtCode as string)
            : undefined,
        provinceCode:
          (data.provinceCode as string) !== undefined
            ? (data.provinceCode as string)
            : undefined,
        village:
          (data.village as string) !== undefined
            ? (data.village as string)
            : undefined,
        // FIX: villageCode was missing from updateProfile — now saved correctly
        villageCode:
          (data.villageCode as string) !== undefined
            ? (data.villageCode as string)
            : undefined,
        farmSizeHectares:
          data.farmSizeHectares !== undefined
            ? (data.farmSizeHectares as number)
            : undefined,
        gpsLatitude:
          data.gpsLatitude !== undefined
            ? (data.gpsLatitude as number)
            : undefined,
        gpsLongitude:
          data.gpsLongitude !== undefined
            ? (data.gpsLongitude as number)
            : undefined,
        waterSource:
          (data.waterSource as WaterSource) !== undefined
            ? (data.waterSource as WaterSource)
            : undefined,
        irrigationType:
          (data.irrigationType as IrrigationType) !== undefined
            ? (data.irrigationType as IrrigationType)
            : undefined,
        preferredChannel:
          (data.preferredChannel as AccessChannel) !== undefined
            ? (data.preferredChannel as AccessChannel)
            : undefined,
        emergencyContact:
          (data.emergencyContact as string) !== undefined
            ? (data.emergencyContact as string)
            : undefined,
        familyMembers:
          data.familyMembers !== undefined
            ? (data.familyMembers as number)
            : undefined,
      },
    });

    console.log(
      "[FarmerService] Saved profile:",
      JSON.stringify({
        userId,
        district: updated.district,
        sector: updated.sector,
        villageCode: updated.villageCode,
        farmSizeHectares: updated.farmSizeHectares,
      }),
    );
    return this.formatProfile(updated);
  }

  async createProfile(userId: string, data: Record<string, unknown>) {
    const existing = await prisma.farmerProfile.findFirst({
      where: { userId },
    });

    if (existing) {
      return this.formatProfile(existing);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const profile = await prisma.farmerProfile.create({
      data: {
        userId,
        fullName:
          (data.fullName as string) ||
          user?.fullName ||
          user?.phone ||
          "Unnamed User",
        farmName: (data.farmName as string) || null,
        location: (data.location as string) || null,
        district: (data.district as string) || "Unknown",
        sector: (data.sector as string) || "Unknown",
        cell: (data.cell as string) || null,
        cellCode: (data.cellCode as string) || null,
        sectorCode: (data.sectorCode as string) || null,
        districtCode: (data.districtCode as string) || null,
        provinceCode: (data.provinceCode as string) || null,
        village: (data.village as string) || null,
        villageCode: (data.villageCode as string) || null,
        farmSizeHectares:
          data.farmSizeHectares !== undefined
            ? (data.farmSizeHectares as number)
            : null,
        gpsLatitude:
          data.gpsLatitude !== undefined ? (data.gpsLatitude as number) : null,
        gpsLongitude:
          data.gpsLongitude !== undefined
            ? (data.gpsLongitude as number)
            : null,
        waterSource: (data.waterSource as WaterSource) || null,
        irrigationType: (data.irrigationType as IrrigationType) || null,
        preferredChannel:
          (data.preferredChannel as AccessChannel) || "smartphone",
        emergencyContact: (data.emergencyContact as string) || null,
        familyMembers:
          data.familyMembers !== undefined ? (data.familyMembers as number) : 0,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { isOnboarded: true },
    });

    return this.formatProfile(profile);
  }

  async getFarmerById(
    id: string,
    requestingUserId: string,
    requestingUserRole: UserRole,
  ) {
    // First try to find the farmer profile by its own ID
    const profile = await prisma.farmerProfile.findFirst({
      where: { id },
      include: { cooperative: true },
    });

    if (!profile) {
      throw new NotFoundError("Farmer");
    }

    // For FARMER role, check if they're trying to access their own profile
    if (
      requestingUserRole === UserRole.FARMER &&
      requestingUserId !== profile.userId
    ) {
      throw new ForbiddenError("You can only view your own profile");
    }

    // For OFFICER role, check if they're assigned to this farmer
    if (requestingUserRole === UserRole.OFFICER) {
      const assignment = await prisma.extensionOfficerAssignment.findFirst({
        where: {
          extensionOfficerId: requestingUserId,
          farmerId: profile.userId, // Note: farmerId in assignment refers to userId
        },
      });

      if (!assignment) {
        throw new ForbiddenError("You are not assigned to this farmer");
      }
    }

    return this.formatProfile(profile);
  }

  async listFarmers(
    params: PaginationParams &
      FilterParams & { cooperativeId?: string; status?: string },
  ) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortBy = params.sortBy ?? "createdAt";
    const sortOrder = params.sortOrder ?? "desc";

    const where: Record<string, unknown> = {};

    if (params.cooperativeId) {
      where.cooperativeId = params.cooperativeId;
    }

    if (params.district) {
      where.district = params.district;
    }

    if (params.sector) {
      where.sector = params.sector;
    }

    if (params.search) {
      where.OR = [
        { fullName: { contains: params.search, mode: "insensitive" } },
        { farmName: { contains: params.search, mode: "insensitive" } },
        { location: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.status) {
      where.user = { status: params.status };
    }

    const [farmers, total] = await Promise.all([
      prisma.farmerProfile.findMany({
        where,
        include: {
          cooperative: true,
          user: true,
          sensors: {
            include: {
              soilReadings: {
                orderBy: { readingAt: "desc" },
                take: 1,
              },
            },
          },
          farmerCrops: {
            include: { crop: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.farmerProfile.count({ where }),
    ]);

    return {
      data: (farmers as any[]).map((f) => this.formatProfile(f)),
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async getAssignedFarmers(
    extensionOfficerId: string,
    params: PaginationParams,
  ) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const assignments = await prisma.extensionOfficerAssignment.findMany({
      where: { extensionOfficerId },
      skip,
      take: limit,
      include: {
        farmer: {
          include: {
            farmerProfile: {
              include: {
                cooperative: true,
                sensors: {
                  include: {
                    soilReadings: {
                      orderBy: { readingAt: "desc" },
                      take: 1,
                    },
                  },
                },
                farmerCrops: {
                  include: { crop: true },
                },
              },
            },
          },
        },
      },
    });

    const total = await prisma.extensionOfficerAssignment.count({
      where: { extensionOfficerId },
    });

    return {
      data: (assignments as any[]).map((a) => this.formatProfile(a.farmer)),
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async assignToOfficer(farmerId: string, extensionOfficerId: string) {
    const farmer = await prisma.farmerProfile.findFirst({
      where: { userId: farmerId },
    });

    if (!farmer) {
      throw new NotFoundError("Farmer");
    }

    const existingAssignment =
      await prisma.extensionOfficerAssignment.findFirst({
        where: { extensionOfficerId, farmerId },
      });

    if (existingAssignment) {
      throw new ValidationError("Farmer already assigned to this officer");
    }

    await prisma.extensionOfficerAssignment.create({
      data: { extensionOfficerId, farmerId },
    });

    return { message: "Farmer assigned successfully" };
  }

  async removeAssignment(farmerId: string, extensionOfficerId: string) {
    await prisma.extensionOfficerAssignment.deleteMany({
      where: { extensionOfficerId, farmerId },
    });

    return { message: "Assignment removed" };
  }

  async addCrop(
    userId: string,
    data: { cropId: string; status: string; plantedDate: string },
  ) {
    const profile = await prisma.farmerProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError("Farmer profile");
    }

    const farmerCrop = await prisma.farmerCrop.create({
      data: {
        farmerId: profile.id,
        cropId: data.cropId,
        status: data.status,
        plantedDate: new Date(data.plantedDate),
      },
      include: { crop: true },
    });

    return farmerCrop;
  }

  async getCrops(userId: string) {
    const profile = await prisma.farmerProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      return [];
    }

    const crops = await prisma.farmerCrop.findMany({
      where: { farmerId: profile.id },
      include: { crop: true },
    });

    return crops;
  }

  async getCropGuidance(userId: string, farmerCropId: string) {
    const profile = await prisma.farmerProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError("Farmer profile");
    }

    const farmerCrop = await prisma.farmerCrop.findFirst({
      where: { id: farmerCropId, farmerId: profile.id },
      include: { crop: true },
    });

    if (!farmerCrop) {
      throw new NotFoundError("Crop");
    }

    return {
      crop: farmerCrop.crop,
      farmerCrop: {
        id: farmerCrop.id,
        plantedDate: farmerCrop.plantedDate,
        expectedHarvestDate: farmerCrop.expectedHarvestDate,
        actualHarvestDate: farmerCrop.actualHarvestDate,
        plotSizeHectares: farmerCrop.plotSizeHectares,
        status: farmerCrop.status,
        estimatedYieldKg: farmerCrop.estimatedYieldKg,
        actualYieldKg: farmerCrop.actualYieldKg,
        notes: farmerCrop.notes,
      },
      growingPeriodDays: farmerCrop.crop.growingPeriodDays,
      waterRequirementMm: farmerCrop.crop.waterRequirementMm,
      nitrogenRequirementKgha: farmerCrop.crop.nitrogenRequirementKgha,
      phosphorusRequirementKgha: farmerCrop.crop.phosphorusRequirementKgha,
      potassiumRequirementKgha: farmerCrop.crop.potassiumRequirementKgha,
      optimalPhMin: farmerCrop.crop.optimalPhMin,
      optimalPhMax: farmerCrop.crop.optimalPhMax,
      optimalTempMinCelsius: farmerCrop.crop.optimalTempMinCelsius,
      optimalTempMaxCelsius: farmerCrop.crop.optimalTempMaxCelsius,
      rootDepthCm: farmerCrop.crop.rootDepthCm,
      cropCoefficient: farmerCrop.crop.cropCoefficient,
    };
  }

  async verifyFarmer(farmerId: string, verifiedBy: string) {
    const profile = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: { user: true },
    });

    if (!profile) {
      throw new NotFoundError("Farmer profile not found");
    }

    // Update the farmer's verification status
    const updatedProfile = await prisma.farmerProfile.update({
      where: { id: farmerId },
      data: {
        verificationStatus: "verified",
        verifiedBy,
        verifiedAt: new Date(),
      },
      include: { user: true },
    });

    // Also activate the user account if it exists
    if (profile.userId) {
      await prisma.user.update({
        where: { id: profile.userId },
        data: {
          status: "active",
          isActive: true,
          isApproved: true,
        },
      });
    }

    return this.formatProfile(updatedProfile);
  }

  async bulkVerifyFarmers(farmerIds: string[], verifiedBy: string) {
    const verificationDate = new Date();
    
    // Update all farmer profiles
    const updatedProfiles = await prisma.$transaction(
      farmerIds.map(id =>
        prisma.farmerProfile.update({
          where: { id },
          data: {
            verificationStatus: "verified",
            verifiedBy,
            verifiedAt: verificationDate,
          },
        })
      )
    );

    // Also activate the user accounts
    const userIds = updatedProfiles
      .map(profile => profile.userId)
      .filter((id): id is string => id !== null);

    if (userIds.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: {
          status: "active",
          isActive: true,
          isApproved: true,
        },
      });
    }

    return {
      verifiedCount: updatedProfiles.length,
      farmerIds: farmerIds,
    };
  }

  private formatProfile(profile: any) {
    if (!profile) return null;
    const isUser = !!profile.farmerProfile;
    const p = isUser ? profile.farmerProfile : profile;
    const u = isUser ? profile : profile.user;

    const profileName = p.fullName;
    const userName = u?.fullName;
    const looksLikePhone = (value?: string | null) =>
      !!value && /^\+?\d{10,15}$/.test(value);
    const rawName =
      profileName && !looksLikePhone(profileName)
        ? profileName
        : userName && !looksLikePhone(userName)
          ? userName
          : null;
    const isPlaceholder =
      !rawName || rawName === "Unnamed Farmer" || rawName === "Unnamed User";
    const resolvedFullName = isPlaceholder ? "Unnamed User" : rawName;

    return {
      id: p.id,
      userId: p.userId || u?.id,
      fullName: resolvedFullName,
      farmName: p.farmName,
      location: p.location,
      district: p.district,
      districtCode: p.districtCode,
      sector: p.sector,
      sectorCode: p.sectorCode,
      cell: p.cell,
      cellCode: p.cellCode,
      provinceCode: p.provinceCode,
      village: p.village,
      villageCode: p.villageCode,
      farmSizeHectares: p.farmSizeHectares,
      gpsLatitude: p.gpsLatitude,
      gpsLongitude: p.gpsLongitude,
      elevationMeters: p.elevationMeters,
      soilType: p.soilType,
      waterSource: p.waterSource,
      irrigationType: p.irrigationType,
      preferredChannel: p.preferredChannel,
      literacyLevel: p.literacyLevel,
      emergencyContact: p.emergencyContact,
      familyMembers: p.familyMembers,
      verificationStatus: p.verificationStatus,
      verifiedBy: p.verifiedBy,
      verifiedAt: p.verifiedAt?.toISOString(),
      cooperative: p.cooperative,
      sensors: p.sensors,
      crops: p.farmerCrops,
      latestSoilReading:
        p.sensors
          ?.flatMap((sensor: any) => sensor.soilReadings || [])
          .sort(
            (a: any, b: any) =>
              new Date(b.readingAt).getTime() - new Date(a.readingAt).getTime(),
          )[0] || null,
      avatarUrl: u?.avatarUrl || p.profileImageUrl || null,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    };
  }
}

export const farmerService = new FarmerService();
