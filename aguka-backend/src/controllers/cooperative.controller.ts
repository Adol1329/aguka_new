import { Request, Response, NextFunction } from "express";
import ExcelJS from "exceljs";
import argon2 from "argon2";
import crypto from "crypto";
import { ApiResponse, JwtPayload, UserRole } from "../types/index.js";
import { auditService } from "../services/audit.service.js";
import { cooperativeService } from "../services/cooperative.service.js";
import { reportService } from "../services/report.service.js";
import { notificationRuleService } from "../services/notification-rule.service.js";
import { smsService } from "../services/sms.service.js";
import { normalizePhone } from "../utils/phone.js";
import { prisma } from "../prisma.js";

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const updateCooperative = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { name, description, district, sector, contactPhone } = req.body;

    const updated = await prisma.cooperative.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(district !== undefined && { district }),
        ...(sector !== undefined && { sector }),
        ...(contactPhone !== undefined && { contactPhone }),
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

export const handleMemberAdd = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    const existing = await prisma.cooperativeMember.findUnique({
      where: { userId },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: "DUPLICATE",
          message: "Member already exists in this cooperative",
        },
      } as ApiResponse<null>);
    }

    const [member] = await prisma.$transaction([
      prisma.cooperativeMember.create({
        data: {
          userId,
          cooperativeId: id,
          role: role || "member",
          status: "active",
        },
        include: {
          user: { include: { farmerProfile: true } },
        },
      }),
      prisma.farmerProfile.updateMany({
        where: { userId },
        data: { cooperativeId: id },
      }),
    ]);

    return res.status(201).json({
      success: true,
      data: {
        id: member.id,
        userId: member.userId,
        cooperativeId: member.cooperativeId,
        fullName: member.user.farmerProfile?.fullName || member.user.phone,
        phone: member.user.phone,
        status: member.status,
        role: member.role,
        joinedAt: member.joinedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyCooperative = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.sub;
    let cooperativeId: string | null = null;

    // 1. Try finding via FarmerProfile
    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId },
    });

    if (farmerProfile?.cooperativeId) {
      cooperativeId = farmerProfile.cooperativeId;
    } else {
      // 2. Try finding via CooperativeMember (for managers)
      const member = await prisma.cooperativeMember.findUnique({
        where: { userId },
      });
      if (member) {
        cooperativeId = member.cooperativeId;
      }
    }

    if (!cooperativeId) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Cooperative not found" },
      } as ApiResponse<null>);
    }

    const cooperative = await prisma.cooperative.findFirst({
      where: { id: cooperativeId, deletedAt: null },
      include: {
        _count: {
          select: { farmers: true, members: true },
        },
      },
    });

    return res.json({
      success: true,
      data: {
        ...cooperative,
        memberCount:
          cooperative?._count.farmers || cooperative?._count.members || 0,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getCooperative = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const cooperative = await prisma.cooperative.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { farmers: true },
        },
      },
    });

    if (!cooperative) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Cooperative not found" },
      } as ApiResponse<null>);
    }

    return res.json({ success: true, data: cooperative });
  } catch (error) {
    return next(error);
  }
};

export const getCooperativeStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const [members, activities, marketplace] = await Promise.all([
      prisma.cooperativeMember.findMany({
        where: { cooperativeId: id },
        include: { user: { include: { farmerProfile: true } } },
      }),
      prisma.cooperativeActivity.findMany({
        where: {
          cooperativeId: id,
          status: "scheduled",
          scheduledAt: { gte: new Date() },
        },
      }),
      prisma.marketplaceListing.findMany({
        where: { cooperativeId: id, status: "available" },
      }),
    ]);

    const activeMembersCount = members.filter(
      (m) => m.status === "active",
    ).length;
    const activeDistributions = await prisma.resourceDistribution.count({
      where: {
        resource: { cooperativeId: id },
        status: "distributed",
      },
    });

    const totalRevenue = marketplace.reduce(
      (sum, l) => sum + Number(l.totalPrice),
      0,
    );
    const totalCrops = await prisma.farmerCrop.count({
      where: {
        farmer: { cooperativeId: id },
      },
    });

    return res.json({
      success: true,
      data: {
        totalMembers: members.length,
        activeMembers: activeMembersCount,
        totalCrops,
        totalYield: 0,
        totalRevenue,
        upcomingActivities: activities.length,
        activeDistributions,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getCooperativeDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const results = await Promise.all([
      prisma.cooperative.findUnique({ where: { id } }),
      prisma.cooperativeMember.findMany({
        where: { cooperativeId: id },
        include: { user: { include: { farmerProfile: true } } },
      }),
      prisma.cooperativeActivity.findMany({
        where: {
          cooperativeId: id,
          status: "scheduled",
          scheduledAt: { gte: new Date() },
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }),
      prisma.marketplaceListing.findMany({
        where: { cooperativeId: id, status: "available" },
      }),
      prisma.cooperativeMember.findMany({
        where: {
          cooperativeId: id,
          status: "active",
          user: { farmerProfile: { isNot: null } },
        },
        include: {
          user: {
            select: {
              fullName: true,
              phone: true,
              farmerProfile: {
                include: {
                  farmerCrops: {
                    select: { plotSizeHectares: true, crop: { select: { nameEn: true } } },
                  },
                  soilReadings: {
                    orderBy: { readingAt: "desc" },
                    take: 1,
                    select: { moisturePercent: true },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const cooperative = results[0];
    const members: any[] = results[1];
    const activities: any[] = results[2];
    const marketplace: any[] = results[3];
    const membersWithCrops: any[] = results[4];

    const activeMembers = members.filter((m: { status: string }) => m.status === "active");
    const totalRevenue = marketplace.reduce(
      (sum: number, l: { totalPrice: any }) => sum + Number(l.totalPrice),
      0,
    );

    // Leaderboard: sort by plot size
    const leaderboard = membersWithCrops
      .map((m: any) => {
        const profile = m.user.farmerProfile;
        const totalArea = profile?.farmerCrops?.reduce(
          (s: number, c: any) => s + Number(c.plotSizeHectares ?? 0),
          0,
        ) ?? 0;
        return {
          farmerName: m.user.fullName ?? m.user.phone,
          totalCrops: profile?.farmerCrops?.length ?? 0,
          totalAreaHectares: totalArea,
          score: totalArea > 0 ? Math.min(100, Math.round(totalArea * 5)) : 0,
        };
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10);

    // Network overview
    const soilMoistures = membersWithCrops
      .map((m: any) =>
        Number(m.user.farmerProfile?.soilReadings?.[0]?.moisturePercent ?? 0),
      )
      .filter((v: number) => v > 0);
    const avgSoilMoisture =
      soilMoistures.length > 0
        ? Math.round(
            (soilMoistures.reduce((s: number, v: number) => s + v, 0) / soilMoistures.length) *
              10,
          ) / 10
        : 0;

    const resourceUtilization = Math.round(
      members.length > 0
        ? (activeMembers.length / members.length) * 100
        : 0,
    );

    // Upcoming events
    const upcomingEvents = activities.map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      scheduledAt: a.scheduledAt,
      location: a.location,
    }));

    // Stats
    const activeHectares = membersWithCrops.reduce((sum: number, m: any) => {
      const area = m.user.farmerProfile?.farmerCrops?.reduce(
        (s: number, c: any) => s + Number(c.plotSizeHectares ?? 0),
        0,
      ) ?? 0;
      return sum + area;
    }, 0);

    const sharedAssets = await prisma.resource.count({
      where: { cooperativeId: id, status: "available" },
    });

    return res.json({
      success: true,
      data: {
        cooperative: {
          name: cooperative?.name ?? "My Cooperative",
        },
        stats: {
          totalMembers: members.length,
          activeHectares: Math.round(activeHectares * 100) / 100,
          networkYield: totalRevenue,
          sharedAssets,
        },
        leaderboard,
        networkOverview: {
          avgSoilMoisture,
          resourceUtilization,
        },
        upcomingEvents,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getMembers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const members = await prisma.cooperativeMember.findMany({
      where: { cooperativeId: id },
      include: {
        user: {
          include: { farmerProfile: true },
        },
      },
    });

    return res.json({
      success: true,
      data: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        fullName: m.user.farmerProfile?.fullName || m.user.phone,
        phone: m.user.phone,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, memberId } = req.params;

    // 📸 CAPTURE BEFORE STATE
    const before = await prisma.cooperativeMember.findUnique({
      where: { id: memberId, cooperativeId: id },
    });

    if (!before) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Member not found" },
      });
    }

    await prisma.$transaction([
      prisma.cooperativeMember.delete({
        where: { id: memberId, cooperativeId: id },
      }),
      prisma.farmerProfile.updateMany({
        where: { userId: before.userId },
        data: { cooperativeId: null },
      }),
    ]);

    // 📜 LOG AUDIT
    if (req.user?.sub) {
      await auditService.logWithSnapshot({
        userId: req.user.sub,
        action: "REMOVE_MEMBER",
        module: "COOPERATIVE",
        resourceId: memberId,
        before,
        after: null,
      });
    }

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const updateMemberStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, memberId } = req.params;
    const { status } = req.body;

    // 📸 CAPTURE BEFORE STATE
    const before = await prisma.cooperativeMember.findUnique({
      where: { id: memberId, cooperativeId: id },
    });

    if (!before) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Member not found" },
      });
    }

    const member = await prisma.cooperativeMember.update({
      where: { id: memberId, cooperativeId: id },
      data: { status },
      include: { user: { include: { farmerProfile: true } } },
    });

    // 📜 LOG AUDIT
    if (req.user?.sub) {
      await auditService.logWithSnapshot({
        userId: req.user.sub,
        action: "UPDATE_MEMBER_STATUS",
        module: "COOPERATIVE",
        resourceId: memberId,
        before,
        after: { status: member.status },
      });
    }

    return res.json({
      success: true,
      data: {
        id: member.id,
        userId: member.userId,
        fullName: member.user.farmerProfile?.fullName || member.user.phone,
        status: member.status,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getActivities = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { type, status, page = "1", limit = "20" } = req.query;

    const where: any = { cooperativeId: id };

    if (type && type !== "all") {
      where.activityType = type;
    }
    if (status && status !== "all") {
      where.status = status;
    }

    const [activities, total] = await Promise.all([
      prisma.cooperativeActivity.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.cooperativeActivity.count({ where }),
    ]);

    return res.json({
      success: true,
      data: activities,
      pagination: {
        currentPage: Number(page),
        pageSize: Number(limit),
        totalItems: total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createActivity = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      activityType,
      scheduledAt,
      location,
      expectedParticipants,
    } = req.body;

    const activity = await prisma.cooperativeActivity.create({
      data: {
        cooperativeId: id,
        title,
        description,
        activityType,
        scheduledAt: new Date(scheduledAt),
        location,
        expectedParticipants: expectedParticipants || 0,
        organizerId: req.user?.sub,
      },
    });

    return res.status(201).json({ success: true, data: activity });
  } catch (error) {
    return next(error);
  }
};

export const updateActivity = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, activityId } = req.params;
    const {
      title, description, activityType, status,
      scheduledAt, location, expectedParticipants,
      actualParticipants, organizerId,
    } = req.body;

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (activityType !== undefined) updates.activityType = activityType;
    if (status !== undefined) updates.status = status;
    if (scheduledAt !== undefined) updates.scheduledAt = new Date(scheduledAt);
    if (location !== undefined) updates.location = location;
    if (expectedParticipants !== undefined) updates.expectedParticipants = Number(expectedParticipants);
    if (actualParticipants !== undefined) updates.actualParticipants = Number(actualParticipants);
    if (organizerId !== undefined) updates.organizerId = organizerId;

    // 📸 CAPTURE BEFORE STATE
    const before = await prisma.cooperativeActivity.findUnique({
      where: { id: activityId, cooperativeId: id },
    });

    const activity = await prisma.cooperativeActivity.update({
      where: { id: activityId, cooperativeId: id },
      data: updates,
    });

    // 📜 LOG AUDIT
    if (req.user?.sub) {
      await auditService.logWithSnapshot({
        userId: req.user.sub,
        action: "UPDATE_ACTIVITY",
        module: "COOPERATIVE",
        resourceId: activityId,
        before,
        after: activity,
      });
    }

    return res.json({ success: true, data: activity });
  } catch (error) {
    return next(error);
  }
};

export const deleteActivity = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, activityId } = req.params;

    // 📸 CAPTURE BEFORE STATE
    const before = await prisma.cooperativeActivity.findUnique({
      where: { id: activityId, cooperativeId: id },
    });

    await prisma.cooperativeActivity.delete({
      where: { id: activityId, cooperativeId: id },
    });

    // 📜 LOG AUDIT
    if (req.user?.sub) {
      await auditService.logWithSnapshot({
        userId: req.user.sub,
        action: "DELETE_ACTIVITY",
        module: "COOPERATIVE",
        resourceId: activityId,
        before,
        after: null,
      });
    }

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const getResources = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { type, status } = req.query;

    const where: any = { cooperativeId: id };

    if (type && type !== "all") {
      where.resourceType = type;
    }
    if (status && status !== "all") {
      where.status = status;
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    });

    return res.json({ success: true, data: resources });
  } catch (error) {
    return next(error);
  }
};

export const addResource = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      resourceType,
      quantity,
      unit,
      condition,
      location,
      minStockLevel,
      expiryDate,
    } = req.body;

    const resource = await prisma.resource.create({
      data: {
        cooperativeId: id,
        name,
        description,
        category,
        resourceType,
        quantity: quantity ? Number(quantity) : null,
        availableQuantity: quantity ? Number(quantity) : null,
        minStockLevel: minStockLevel ? Number(minStockLevel) : null,
        unit,
        condition,
        location,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: "available",
        addedBy: req.user?.sub || "",
      },
    });

    return res.status(201).json({ success: true, data: resource });
  } catch (error) {
    return next(error);
  }
};

export const updateResource = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, resourceId } = req.params;
    const {
      name, description, category, resourceType, status,
      quantity, availableQuantity, minStockLevel, unit,
      condition, location, isAvailable, expiryDate,
      lastMaintenance, nextMaintenance,
    } = req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (resourceType !== undefined) updates.resourceType = resourceType;
    if (status !== undefined) updates.status = status;
    if (quantity !== undefined) updates.quantity = Number(quantity);
    if (availableQuantity !== undefined) updates.availableQuantity = Number(availableQuantity);
    if (minStockLevel !== undefined) updates.minStockLevel = Number(minStockLevel);
    if (unit !== undefined) updates.unit = unit;
    if (condition !== undefined) updates.condition = condition;
    if (location !== undefined) updates.location = location;
    if (isAvailable !== undefined) updates.isAvailable = Boolean(isAvailable);
    if (expiryDate !== undefined) updates.expiryDate = new Date(expiryDate);
    if (lastMaintenance !== undefined) updates.lastMaintenance = new Date(lastMaintenance);
    if (nextMaintenance !== undefined) updates.nextMaintenance = new Date(nextMaintenance);

    // 📸 CAPTURE BEFORE STATE
    const before = await prisma.resource.findUnique({
      where: { id: resourceId, cooperativeId: id },
    });

    const resource = await prisma.resource.update({
      where: { id: resourceId, cooperativeId: id },
      data: updates,
    });

    // 📜 LOG AUDIT
    if (req.user?.sub) {
      await auditService.logWithSnapshot({
        userId: req.user.sub,
        action: "UPDATE_RESOURCE",
        module: "COOPERATIVE",
        resourceId: resourceId,
        before,
        after: resource,
      });
    }

    return res.json({ success: true, data: resource });
  } catch (error) {
    return next(error);
  }
};

export const deleteResource = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, resourceId } = req.params;

    // 📸 CAPTURE BEFORE STATE
    const before = await prisma.resource.findUnique({
      where: { id: resourceId, cooperativeId: id },
    });

    await prisma.resource.delete({
      where: { id: resourceId, cooperativeId: id },
    });

    // 📜 LOG AUDIT
    if (req.user?.sub) {
      await auditService.logWithSnapshot({
        userId: req.user.sub,
        action: "DELETE_RESOURCE",
        module: "COOPERATIVE",
        resourceId: resourceId,
        before,
        after: null,
      });
    }

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const distributeResource = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, resourceId } = req.params;
    const { farmerId, quantity, notes } = req.body;

    const distribution = await cooperativeService.distributeResource({
      resourceId,
      cooperativeId: id,
      farmerId,
      assignedById: req.user?.sub || "",
      quantity: quantity ? Number(quantity) : undefined,
      notes,
    });

    // 🔔 TRIGGER NOTIFICATION
    await notificationRuleService.createNotification({
      userId: farmerId,
      title: "Resource Allocated",
      message: `You have been allocated ${distribution.quantity || ""} ${distribution.unit || "units"} of ${distribution.resource.name}. Please collect it from ${distribution.location || "the cooperative depot"}.`,
      type: "system",
      priority: "high",
      metadata: {
        distributionId: distribution.id,
        resourceId: distribution.resourceId,
      },
    });

    return res.status(201).json({ success: true, data: distribution });
  } catch (error: any) {
    return next(error);
  }
};

export const getResourceDistributions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status, farmerId } = req.query;

    const distributions = await prisma.resourceDistribution.findMany({
      where: {
        resource: { cooperativeId: id },
        ...(status && status !== "all" ? { status: status as string } : {}),
        ...(farmerId ? { farmerId: farmerId as string } : {}),
      },
      include: {
        resource: true,
        farmer: {
          select: {
            fullName: true,
            phone: true,
          },
        },
      },
      orderBy: { distributedAt: "desc" },
    });

    return res.json({ success: true, data: distributions });
  } catch (error) {
    return next(error);
  }
};

export const getMarketplace = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status, cropId } = req.query;

    const where: any = { cooperativeId: id };

    if (status && status !== "all") {
      where.status = status;
    }
    if (cropId) {
      where.cropId = cropId;
    }

    const listings = await prisma.marketplaceListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: listings });
  } catch (error) {
    return next(error);
  }
};

export const createListing = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const {
      productName,
      cropId,
      quantity,
      unit,
      pricePerUnit,
      harvestDate,
      quality,
    } = req.body;

    const totalPrice = Number(quantity) * Number(pricePerUnit);

    const listing = await prisma.marketplaceListing.create({
      data: {
        cooperativeId: id,
        productName,
        cropId,
        quantity,
        unit: unit || "kg",
        pricePerUnit,
        totalPrice,
        availableQuantity: quantity,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        quality,
        listedBy: req.user?.sub || "",
        status: "available",
      },
    });

    return res.status(201).json({ success: true, data: listing });
  } catch (error) {
    return next(error);
  }
};

export const updateListing = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, listingId } = req.params;
    const {
      productName, quantity, pricePerUnit, unit,
      quality, status, harvestDate, availableQuantity,
    } = req.body;

    const updates: Record<string, unknown> = {};
    if (productName !== undefined) updates.productName = productName;
    if (unit !== undefined) updates.unit = unit;
    if (quality !== undefined) updates.quality = quality;
    if (status !== undefined) updates.status = status;
    if (harvestDate !== undefined) updates.harvestDate = new Date(harvestDate);

    if (quantity !== undefined) {
      updates.quantity = Number(quantity);
      updates.availableQuantity = Number(quantity);
    }
    if (availableQuantity !== undefined && quantity === undefined) {
      updates.availableQuantity = Number(availableQuantity);
    }
    if (pricePerUnit !== undefined) {
      updates.pricePerUnit = Number(pricePerUnit);
    }
    if (quantity !== undefined && pricePerUnit !== undefined) {
      updates.totalPrice = Number(quantity) * Number(pricePerUnit);
    }

    // 📸 CAPTURE BEFORE STATE
    const before = await prisma.marketplaceListing.findUnique({
      where: { id: listingId, cooperativeId: id },
    });

    const listing = await prisma.marketplaceListing.update({
      where: { id: listingId, cooperativeId: id },
      data: updates,
    });

    // 📜 LOG AUDIT
    if (req.user?.sub) {
      await auditService.logWithSnapshot({
        userId: req.user.sub,
        action: "UPDATE_LISTING",
        module: "COOPERATIVE",
        resourceId: listingId,
        before,
        after: listing,
      });
    }

    return res.json({ success: true, data: listing });
  } catch (error) {
    return next(error);
  }
};

export const getAnnouncements = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const announcements = await prisma.announcement.findMany({
      where: { cooperativeId: id },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: announcements });
  } catch (error) {
    return next(error);
  }
};

export const createAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { title, content, priority } = req.body;

    const announcement = await prisma.announcement.create({
      data: {
        cooperativeId: id,
        title,
        content,
        priority: priority || "normal",
        createdBy: req.user?.sub || "",
      },
    });

    return res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    return next(error);
  }
};

export const markAnnouncementRead = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const getMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { limit = "50", before } = req.query;

    const where: any = { cooperativeId: id };

    if (before) {
      where.createdAt = { lt: new Date(before as string) };
    }

    const messages = await prisma.groupMessage.findMany({
      where,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    return next(error);
  }
};

export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user?.sub },
      include: { farmerProfile: true },
    });

    const message = await prisma.groupMessage.create({
      data: {
        cooperativeId: id,
        senderId: req.user?.sub || "",
        senderName: user?.farmerProfile?.fullName || user?.phone || "Unknown",
        content,
      },
    });

    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    return next(error);
  }
};

export const getReports = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    const reports = await prisma.cooperativeReport.findMany({
      where: {
        cooperativeId: id,
        ...(type ? { reportType: type as string } : {}),
      },
      orderBy: { generatedAt: "desc" },
    });

    return res.json({ success: true, data: reports });
  } catch (error) {
    return next(error);
  }
};

export const generateReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { title, reportType, periodStart, periodEnd } = req.body;

    const data = await generateReportData(
      id,
      reportType,
      new Date(periodStart),
      new Date(periodEnd),
    );

    const report = await prisma.cooperativeReport.create({
      data: {
        cooperativeId: id,
        title,
        reportType,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        summary: `Report generated for ${periodStart} to ${periodEnd}`,
        data,
        generatedBy: req.user?.sub || "",
      },
    });

    return res.status(201).json({ success: true, data: report });
  } catch (error) {
    return next(error);
  }
};

export const getCooperativePerformance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    // Check if user has access to this cooperative
    const userId = req.user?.sub;
    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId },
    });
    const cooperativeMember = await prisma.cooperativeMember.findUnique({
      where: { userId },
    });

    // Allow access if user is admin/super_admin or belongs to the cooperative (as farmer or manager)
    const isAdmin =
      req.user?.role === UserRole.ADMIN ||
      req.user?.role === UserRole.SUPER_ADMIN;
    const isMember =
      farmerProfile?.cooperativeId === id ||
      cooperativeMember?.cooperativeId === id;

    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Access denied" },
      } as ApiResponse<null>);
    }

    // Parse date range from query parameters if provided
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (req.query.periodStart) {
      startDate = new Date(req.query.periodStart as string);
    }

    if (req.query.periodEnd) {
      endDate = new Date(req.query.periodEnd as string);
    }

    const performanceData =
      await cooperativeService.getFarmerPerformanceComparison(
        id,
        startDate,
        endDate,
      );

    return res.json({ success: true, data: performanceData });
  } catch (error) {
    return next(error);
  }
};

export const exportPerformanceReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    // Authorization check
    const userId = req.user?.sub;
    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId },
    });
    const cooperativeMember = await prisma.cooperativeMember.findUnique({
      where: { userId },
    });

    const isAdmin =
      req.user?.role === UserRole.ADMIN ||
      req.user?.role === UserRole.SUPER_ADMIN;
    const isMember =
      farmerProfile?.cooperativeId === id ||
      cooperativeMember?.cooperativeId === id;

    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Access denied" },
      } as ApiResponse<null>);
    }

    const coop = await prisma.cooperative.findUnique({ where: { id } });
    if (!coop) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Cooperative not found" },
      } as ApiResponse<null>);
    }

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (req.query.periodStart)
      startDate = new Date(req.query.periodStart as string);
    if (req.query.periodEnd) endDate = new Date(req.query.periodEnd as string);

    const stats = await cooperativeService.getFarmerPerformanceComparison(
      id,
      startDate,
      endDate,
    );

    const pdfBuffer = await reportService.exportCooperativeReportPdf(
      coop,
      stats,
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${coop.name.replace(/ /g, "_")}_Performance.pdf`,
    );
    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
};

export const getAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const [soilReadings, farmers, irrigationLogs, crops] = await Promise.all([
      prisma.soilReading.findMany({
        where: { farmer: { cooperativeId: id } },
        orderBy: { readingAt: "desc" },
        include: { farmer: { select: { fullName: true, farmName: true } } },
      }),
      prisma.farmerProfile.findMany({
        where: { cooperativeId: id },
        select: {
          id: true,
          fullName: true,
          farmSizeHectares: true,
          district: true,
        },
      }),
      prisma.irrigationLog.findMany({
        where: { farmer: { cooperativeId: id } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.farmerCrop.findMany({
        where: { farmer: { cooperativeId: id } },
        include: { crop: true },
      }),
    ]);

    const avgMoisture = soilReadings.length
      ? soilReadings.reduce((s, r) => s + Number(r.moisturePercent || 0), 0) /
        soilReadings.length
      : 0;
    const avgTemperature = soilReadings.length
      ? soilReadings.reduce(
          (s, r) => s + Number(r.temperatureCelsius || 0),
          0,
        ) / soilReadings.length
      : 0;
    const avgPh = soilReadings.length
      ? soilReadings.reduce((s, r) => s + Number(r.phLevel || 0), 0) /
        soilReadings.length
      : 0;

    const farmersWithIrrigation = irrigationLogs.length
      ? new Set(irrigationLogs.map((l) => l.farmerId)).size
      : 0;
    const irrigationCompliance = farmers.length
      ? Math.round((farmersWithIrrigation / farmers.length) * 100)
      : 0;

    const cropHealthByType = crops.reduce(
      (acc, c) => {
        const name = c.crop.nameEn;
        if (!acc[name]) acc[name] = { count: 0, totalYield: 0 };
        acc[name].count++;
        acc[name].totalYield += Number(c.estimatedYieldKg || 0);
        return acc;
      },
      {} as Record<string, { count: number; totalYield: number }>,
    );

    const recentSoil = soilReadings.slice(0, 20);

    return res.json({
      success: true,
      data: {
        soil: {
          averageMoisture: Math.round(avgMoisture * 10) / 10,
          averageTemperature: Math.round(avgTemperature * 10) / 10,
          averagePh: Math.round(avgPh * 100) / 100,
          totalReadings: soilReadings.length,
          recentReadings: recentSoil.map((r) => ({
            id: r.id,
            farmerName: r.farmer.fullName,
            farmName: r.farmer.farmName,
            moisturePercent: Number(r.moisturePercent || 0),
            temperatureCelsius: r.temperatureCelsius
              ? Number(r.temperatureCelsius)
              : null,
            phLevel: r.phLevel ? Number(r.phLevel) : null,
            readingAt: r.readingAt,
          })),
        },
        weather: {
          temperatureTrend: recentSoil.map((r) => ({
            date: r.readingAt,
            temperature: r.temperatureCelsius
              ? Number(r.temperatureCelsius)
              : null,
          })),
          lastUpdated: soilReadings[0]?.readingAt || null,
        },
        irrigation: {
          complianceRate: irrigationCompliance,
          totalFarmers: farmers.length,
          farmersWithIrrigation,
          totalLogs: irrigationLogs.length,
        },
        cropHealth: {
          totalCrops: crops.length,
          totalFarmers: farmers.length,
          byType: cropHealthByType,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getFarmerDetail = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, farmerId } = req.params;

    const farmer = await prisma.farmerProfile.findFirst({
      where: { id: farmerId, cooperativeId: id },
      include: {
        user: {
          select: { id: true, phone: true, email: true, isOnboarded: true },
        },
        _count: { select: { farmerCrops: true, farmActivities: true } },
      },
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Farmer not found in cooperative",
        },
      } as ApiResponse<null>);
    }

    const [soilReadings, crops, activities, distributions] = await Promise.all([
      prisma.soilReading.findMany({
        where: { farmerId },
        orderBy: { readingAt: "desc" },
        take: 10,
      }),
      prisma.farmerCrop.findMany({
        where: { farmerId },
        include: { crop: true },
      }),
      prisma.farmActivity.findMany({
        where: { farmerId },
        orderBy: { activityDate: "desc" },
        take: 10,
      }),
      prisma.resourceDistribution.findMany({
        where: { farmerId: farmer.userId },
        include: { resource: true },
        orderBy: { distributedAt: "desc" },
        take: 10,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        ...farmer,
        soilReadings,
        crops,
        activities,
        distributions,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getJoinRequests = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const requests = await prisma.memberRequest.findMany({
      where: { cooperativeId: id, status: "pending" },
      include: {
        cooperative: { select: { name: true } },
      },
      orderBy: { requestedAt: "desc" },
    });

    const userIds = requests.map((r) => r.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { farmerProfile: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return res.json({
      success: true,
      data: requests.map((r) => ({
        id: r.id,
        userId: r.userId,
        fullName:
          userMap.get(r.userId)?.farmerProfile?.fullName ||
          userMap.get(r.userId)?.phone ||
          "Unknown",
        phone: userMap.get(r.userId)?.phone || "",
        status: r.status,
        requestedAt: r.requestedAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const approveJoinRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, requestId } = req.params;

    const request = await prisma.memberRequest.findUnique({
      where: { id: requestId, cooperativeId: id },
    });

    if (!request || request.status !== "pending") {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Pending request not found" },
      } as ApiResponse<null>);
    }

    await prisma.$transaction([
      prisma.cooperativeMember.create({
        data: { userId: request.userId, cooperativeId: id, status: "active" },
      }),
      prisma.farmerProfile.updateMany({
        where: { userId: request.userId },
        data: { cooperativeId: id },
      }),
      prisma.memberRequest.update({
        where: { id: requestId },
        data: {
          status: "approved",
          reviewedAt: new Date(),
          reviewedBy: req.user?.sub,
        },
      }),
    ]);

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const submitJoinRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ success: false });

    const alreadyMember = await prisma.cooperativeMember.findFirst({
      where: { userId, cooperativeId: id },
    });
    if (alreadyMember) {
      return res.status(409).json({
        success: false,
        error: { code: "ALREADY_MEMBER", message: "Already a member of this cooperative" },
      });
    }

    const existingRequest = await prisma.memberRequest.findUnique({
      where: { userId },
    });
    if (existingRequest && existingRequest.status === "pending") {
      return res.status(409).json({
        success: false,
        error: { code: "REQUEST_PENDING", message: "Membership request already pending" },
      });
    }

    // MemberRequest.userId is globally unique, so a user who was previously rejected
    // (or applied elsewhere) needs their existing row updated rather than a new one created.
    const request = existingRequest
      ? await prisma.memberRequest.update({
          where: { userId },
          data: {
            cooperativeId: id,
            status: "pending",
            requestedAt: new Date(),
            reviewedAt: null,
            reviewedBy: null,
          },
        })
      : await prisma.memberRequest.create({
          data: { cooperativeId: id, userId, status: "pending" },
        });

    return res.status(201).json({ success: true, data: { id: request.id } });
  } catch (error) {
    return next(error);
  }
};

export const getMyJoinRequests = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ success: false });

    const request = await prisma.memberRequest.findUnique({
      where: { userId },
      include: { cooperative: { select: { id: true, name: true, district: true, sector: true } } },
    });

    return res.json({
      success: true,
      data: request
        ? {
            id: request.id,
            cooperativeId: request.cooperativeId,
            cooperativeName: request.cooperative.name,
            status: request.status,
            requestedAt: request.requestedAt,
            reviewedAt: request.reviewedAt,
          }
        : null,
    });
  } catch (error) {
    return next(error);
  }
};

export const rejectJoinRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, requestId } = req.params;

    const request = await prisma.memberRequest.findUnique({
      where: { id: requestId, cooperativeId: id },
    });

    if (!request || request.status !== "pending") {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Pending request not found" },
      } as ApiResponse<null>);
    }

    await prisma.memberRequest.update({
      where: { id: requestId },
      data: {
        status: "rejected",
        reviewedAt: new Date(),
        reviewedBy: req.user?.sub,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const getEventAttendees = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, activityId } = req.params;

    const activity = await prisma.cooperativeActivity.findUnique({
      where: { id: activityId, cooperativeId: id },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Activity not found" },
      } as ApiResponse<null>);
    }

    const attendees = await prisma.eventAttendee.findMany({
      where: { activityId },
    });

    const userIds = attendees.map((a) => a.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { farmerProfile: { select: { fullName: true } } },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return res.json({
      success: true,
      data: {
        activity: {
          id: activity.id,
          title: activity.title,
          expectedParticipants: activity.expectedParticipants,
          actualParticipants: activity.actualParticipants,
        },
        attendees: attendees.map((a) => ({
          id: a.id,
          userId: a.userId,
          fullName:
            userMap.get(a.userId)?.farmerProfile?.fullName ||
            userMap.get(a.userId)?.phone ||
            "Unknown",
          status: a.status,
          attendedAt: a.attendedAt,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const markAttendance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, activityId } = req.params;
    const { userId, status } = req.body;

    const activity = await prisma.cooperativeActivity.findUnique({
      where: { id: activityId, cooperativeId: id },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Activity not found" },
      } as ApiResponse<null>);
    }

    const attendee = await prisma.eventAttendee.upsert({
      where: { activityId_userId: { activityId, userId } },
      create: { activityId, userId, status: status || "pending" },
      update: {
        status: status || "pending",
        attendedAt: status === "attended" ? new Date() : null,
      },
    });

    const confirmedCount = await prisma.eventAttendee.count({
      where: { activityId, status: { in: ["attended", "confirmed"] } },
    });

    await prisma.cooperativeActivity.update({
      where: { id: activityId },
      data: { actualParticipants: confirmedCount },
    });

    return res.json({ success: true, data: attendee });
  } catch (error) {
    return next(error);
  }
};

export const removeAttendee = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, activityId, attendeeId } = req.params;

    const activity = await prisma.cooperativeActivity.findUnique({
      where: { id: activityId, cooperativeId: id },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Activity not found" },
      } as ApiResponse<null>);
    }

    await prisma.eventAttendee.delete({
      where: { id: attendeeId, activityId },
    });

    const confirmedCount = await prisma.eventAttendee.count({
      where: { activityId, status: { in: ["attended", "confirmed"] } },
    });

    await prisma.cooperativeActivity.update({
      where: { id: activityId },
      data: { actualParticipants: confirmedCount },
    });

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const updateDistributionStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, distributionId } = req.params;
    const { status, returnedAt } = req.body;

    const distribution = await prisma.resourceDistribution.findFirst({
      where: { id: distributionId, resource: { cooperativeId: id } },
    });

    if (!distribution) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Distribution record not found" },
      } as ApiResponse<null>);
    }

    const updated = await prisma.resourceDistribution.update({
      where: { id: distributionId },
      data: {
        status: status || distribution.status,
        returnedAt: returnedAt ? new Date(returnedAt) : distribution.returnedAt,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

export const getDues = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const where: any = { cooperativeId: id };
    if (status && status !== "all") where.status = status;

    const dues = await prisma.memberDue.findMany({
      where,
      orderBy: { dueDate: "desc" },
    });

    const userIds = [...new Set(dues.map((d) => d.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { farmerProfile: { select: { fullName: true } } },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return res.json({
      success: true,
      data: dues.map((d) => ({
        id: d.id,
        userId: d.userId,
        fullName:
          userMap.get(d.userId)?.farmerProfile?.fullName ||
          userMap.get(d.userId)?.phone ||
          "Unknown",
        amount: Number(d.amount),
        period: d.period,
        status: d.status,
        dueDate: d.dueDate,
        paidAt: d.paidAt,
        notes: d.notes,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const createDue = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { userId, amount, period, dueDate, notes } = req.body;

    const due = await prisma.memberDue.create({
      data: {
        cooperativeId: id,
        userId,
        amount,
        period,
        dueDate: new Date(dueDate),
        notes,
      },
    });

    return res.status(201).json({ success: true, data: due });
  } catch (error) {
    return next(error);
  }
};

export const updateDue = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, dueId } = req.params;
    const { status, paidAt, notes } = req.body;

    const due = await prisma.memberDue.findFirst({
      where: { id: dueId, cooperativeId: id },
    });

    if (!due) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Due not found" },
      } as ApiResponse<null>);
    }

    const updated = await prisma.memberDue.update({
      where: { id: dueId },
      data: {
        status: status || due.status,
        paidAt: paidAt
          ? new Date(paidAt)
          : status === "paid"
            ? new Date()
            : due.paidAt,
        notes: notes !== undefined ? notes : due.notes,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

export const deleteDue = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, dueId } = req.params;

    const due = await prisma.memberDue.findFirst({
      where: { id: dueId, cooperativeId: id },
    });

    if (!due) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Due not found" },
      } as ApiResponse<null>);
    }

    await prisma.memberDue.delete({ where: { id: dueId } });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const getExpenses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { category } = req.query;

    const where: any = { cooperativeId: id };
    if (category && category !== "all") where.category = category;

    const expenses = await prisma.cooperativeExpense.findMany({
      where,
      orderBy: { expenseDate: "desc" },
    });

    return res.json({ success: true, data: expenses });
  } catch (error) {
    return next(error);
  }
};

export const createExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { category, amount, description, receiptUrl, expenseDate } = req.body;

    const expense = await prisma.cooperativeExpense.create({
      data: {
        cooperativeId: id,
        category,
        amount,
        description,
        receiptUrl,
        recordedBy: req.user?.sub || "",
        expenseDate: new Date(expenseDate),
      },
    });

    return res.status(201).json({ success: true, data: expense });
  } catch (error) {
    return next(error);
  }
};

export const deleteExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, expenseId } = req.params;

    const expense = await prisma.cooperativeExpense.findFirst({
      where: { id: expenseId, cooperativeId: id },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Expense not found" },
      } as ApiResponse<null>);
    }

    await prisma.cooperativeExpense.delete({ where: { id: expenseId } });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const sendEventReminder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, activityId } = req.params;

    const activity = await prisma.cooperativeActivity.findUnique({
      where: { id: activityId, cooperativeId: id },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Activity not found" },
      } as ApiResponse<null>);
    }

    const members = await prisma.cooperativeMember.findMany({
      where: { cooperativeId: id, status: "active" },
    });

    const memberUserIds = members.map((m) => m.userId);

    await prisma.notification.createMany({
      data: memberUserIds.map((userId) => ({
        userId,
        title: `Event Reminder: ${activity.title}`,
        message: `Reminder for "${activity.title}" on ${new Date(activity.scheduledAt).toLocaleDateString()} at ${activity.location || "TBD"}.`,
        type: "event",
        status: "unread",
        link: `/cooperative/events`,
      })),
    });

    return res.json({
      success: true,
      data: { notifiedCount: memberUserIds.length },
    });
  } catch (error) {
    return next(error);
  }
};

async function generateReportData(
  cooperativeId: string,
  reportType: string,
  start: Date,
  end: Date,
) {
  switch (reportType) {
    case "performance": {
      // Use the real cooperative service to get performance data
      const performanceData =
        await cooperativeService.getFarmerPerformanceComparison(
          cooperativeId,
          start,
          end,
        );

      return {
        totalMembers: performanceData.rankings.length,
        activeMembers: performanceData.rankings.filter(
          (farmer) =>
            farmer.soilMoistureAvg !== null ||
            farmer.activitiesCount > 0 ||
            farmer.irrigationCount > 0,
        ).length,
        memberGrowth: 0, // This would require historical data to calculate properly
        averageScore: performanceData.averageScore,
        topPerformer: performanceData.topPerformer
          ? `${performanceData.topPerformer.fullName} (${performanceData.topPerformer.overallScore.toFixed(1)}%)`
          : "None",
        performanceDetails: performanceData.rankings.map((farmer) => ({
          id: farmer.id,
          name: farmer.fullName,
          district: farmer.district,
          farmName: farmer.farmName,
          soilMoistureAvg: farmer.soilMoistureAvg,
          activitiesCount: farmer.activitiesCount,
          irrigationCount: farmer.irrigationCount,
          overallScore: farmer.overallScore,
        })),
      };
    }

    case "yield": {
      const crops = await prisma.farmerCrop.findMany({
        where: {
          farmer: { cooperativeId },
          plantedDate: { gte: start, lte: end },
        },
        include: { crop: true },
      });
      return {
        totalCrops: crops.length,
        estimatedYield: crops.reduce(
          (sum, c) => sum + Number(c.estimatedYieldKg || 0),
          0,
        ),
        cropsByType: crops.reduce((acc, c) => {
          acc[c.crop.nameEn] = (acc[c.crop.nameEn] || 0) + 1;
          return acc;
        }, {} as any),
      };
    }

    case "soil": {
      // Query real soil readings for the cooperative's farmers in the date range
      const soilReadings = await prisma.soilReading.findMany({
        where: {
          farmer: {
            cooperativeId,
          },
          readingAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          farmer: {
            select: {
              id: true,
              fullName: true,
              farmName: true,
            },
          },
        },
        orderBy: {
          readingAt: "desc",
        },
      });

      // Calculate averages
      const avgMoisture =
        soilReadings.length > 0
          ? soilReadings.reduce(
              (sum, r) => sum + Number(r.moisturePercent || 0),
              0,
            ) / soilReadings.length
          : 0;

      const avgTemperature =
        soilReadings.length > 0
          ? soilReadings.reduce(
              (sum, r) => sum + Number(r.temperatureCelsius || 0),
              0,
            ) / soilReadings.length
          : 0;

      const avgPh =
        soilReadings.length > 0
          ? soilReadings.reduce((sum, r) => sum + Number(r.phLevel || 0), 0) /
            soilReadings.length
          : 0;

      return {
        totalReadings: soilReadings.length,
        averageMoisture: Number(avgMoisture.toFixed(2)),
        averageTemperature: Number(avgTemperature.toFixed(2)),
        averagePh: Number(avgPh.toFixed(2)),
        readings: soilReadings.map((reading) => ({
          id: reading.id,
          farmerName: reading.farmer.fullName,
          farmName: reading.farmer.farmName,
          moisturePercent: Number(reading.moisturePercent || 0),
          temperatureCelsius: reading.temperatureCelsius
            ? Number(reading.temperatureCelsius)
            : null,
          phLevel: reading.phLevel ? Number(reading.phLevel) : null,
          readingAt: reading.readingAt,
        })),
      };
    }

    case "activity": {
      // Query real farm activities for the cooperative's farmers in the date range
      const activities = await prisma.farmActivity.findMany({
        where: {
          farmer: {
            cooperativeId,
          },
          activityDate: {
            gte: start,
            lte: end,
          },
        },
        include: {
          farmer: {
            select: {
              id: true,
              fullName: true,
              farmName: true,
            },
          },
        },
        orderBy: {
          activityDate: "desc",
        },
      });

      // Group by activity type
      const activitiesByType = activities.reduce(
        (acc, activity) => {
          const type = activity.activityType || "other";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        totalActivities: activities.length,
        activitiesByType,
        activities: activities.map((activity) => ({
          id: activity.id,
          farmerName: activity.farmer.fullName,
          farmName: activity.farmer.farmName,
          activityType: activity.activityType,
          category: activity.category,
          quantity: activity.quantity,
          unit: activity.unit,
          costRwf: activity.costRwf,
          activityDate: activity.activityDate,
        })),
      };
    }

    case "financial": {
      // Query real payment records for the cooperative's farmers
      const payments = await prisma.payment.findMany({
        where: {
          user: {
            farmerProfile: {
              cooperativeId,
            },
          },
          createdAt: {
            gte: start,
            lte: end,
          },
          status: {
            not: "pending", // Only count completed/failed payments
          },
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
        },
      });

      if (payments.length === 0) {
        return {
          message: "No payment data available for the selected period",
        };
      }

      const totalAmount = payments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0,
      );

      const successfulPayments = payments.filter(
        (p) => p.status === "completed" || p.status === "processed",
      );

      const successfulAmount = successfulPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0,
      );

      return {
        totalPayments: payments.length,
        successfulPayments: successfulPayments.length,
        totalAmount: Number(totalAmount.toFixed(2)),
        successfulAmount: Number(successfulAmount.toFixed(2)),
        averagePayment:
          payments.length > 0
            ? Number((totalAmount / payments.length).toFixed(2))
            : 0,
        payments: payments.map((payment) => ({
          id: payment.id,
          userName: payment.user.fullName,
          userPhone: payment.user.phone,
          amount: Number(payment.amount || 0),
          currency: payment.currency,
          paymentType: payment.paymentType,
          status: payment.status,
          createdAt: payment.createdAt,
        })),
      };
    }

    case "membership":
      return {
        totalMembers: await prisma.cooperativeMember.count({
          where: { cooperativeId },
        }),
        byStatus: {
          active: await prisma.cooperativeMember.count({
            where: { cooperativeId, status: "active" },
          }),
          inactive: await prisma.cooperativeMember.count({
            where: { cooperativeId, status: "inactive" },
          }),
          suspended: await prisma.cooperativeMember.count({
            where: { cooperativeId, status: "suspended" },
          }),
        },
      };

    default:
      return {};
  }
}

export const listCooperatives = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const district = (req.query.districtId || req.query.district) as string;
    const where: any = { deletedAt: null };
    if (district) {
      where.district = { equals: district, mode: "insensitive" };
    }
    const coops = await prisma.cooperative.findMany({
      where,
      orderBy: { name: "asc" },
    });
    return res.json({ success: true, data: coops });
  } catch (error) {
    return next(error);
  }
};

export const createCooperative = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, district, sector, contactPhone, description } = req.body;

    const cooperative = await prisma.cooperative.create({
      data: { name, district, sector, contactPhone, description },
    });

    if (req.user?.sub) {
      await auditService.logWithSnapshot({
        userId: req.user.sub,
        action: "CREATE_COOPERATIVE",
        module: "COOPERATIVE",
        resourceId: cooperative.id,
        before: null,
        after: cooperative,
      });
    }

    return res.status(201).json({ success: true, data: cooperative });
  } catch (error) {
    return next(error);
  }
};

export const assignManager = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const cooperative = await prisma.cooperative.findFirst({
      where: { id, deletedAt: null },
    });
    if (!cooperative) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Cooperative not found" },
      } as ApiResponse<null>);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "User not found" },
      } as ApiResponse<null>);
    }
    if (user.role !== UserRole.COOPERATIVE) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ROLE",
          message: "User must have the cooperative role to be assigned as manager",
        },
      } as ApiResponse<null>);
    }

    const existingMembership = await prisma.cooperativeMember.findUnique({
      where: { userId },
    });
    if (existingMembership && existingMembership.cooperativeId !== id) {
      return res.status(409).json({
        success: false,
        error: {
          code: "ALREADY_MEMBER",
          message: "User already belongs to a different cooperative",
        },
      } as ApiResponse<null>);
    }

    const member = await prisma.$transaction(async (tx) => {
      // Ensure only one manager per cooperative
      await tx.cooperativeMember.updateMany({
        where: { cooperativeId: id, role: "manager", userId: { not: userId } },
        data: { role: "member" },
      });

      if (existingMembership) {
        return tx.cooperativeMember.update({
          where: { userId },
          data: { role: "manager", status: "active" },
          include: { user: { include: { farmerProfile: true } } },
        });
      }

      return tx.cooperativeMember.create({
        data: { userId, cooperativeId: id, role: "manager", status: "active" },
        include: { user: { include: { farmerProfile: true } } },
      });
    });

    if (req.user?.sub) {
      await auditService.logWithSnapshot({
        userId: req.user.sub,
        action: "ASSIGN_COOPERATIVE_MANAGER",
        module: "COOPERATIVE",
        resourceId: id,
        before: existingMembership,
        after: member,
      });
    }

    return res.json({
      success: true,
      data: {
        id: member.id,
        userId: member.userId,
        cooperativeId: member.cooperativeId,
        fullName: member.user.farmerProfile?.fullName || member.user.phone,
        role: member.role,
        status: member.status,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const FARMER_IMPORT_HEADERS = [
  "Full Name",
  "Phone",
  "District",
  "Sector",
  "Cell",
  "Village",
  "Farm Size (Hectares)",
  "Water Source",
];
const VALID_WATER_SOURCES = ["rainwater", "well", "river", "municipal", "other"];

export const getFarmerImportTemplate = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "AGUKA SMART FARMING KIT";
    const sheet = workbook.addWorksheet("Farmers");

    sheet.columns = FARMER_IMPORT_HEADERS.map((h) => ({ header: h, key: h, width: 22 }));
    sheet.getRow(1).font = { bold: true };
    sheet.addRow({
      "Full Name": "Jean Mukamana",
      Phone: "0788123456",
      District: "Nyamagabe",
      Sector: "Gasaka",
      Cell: "",
      Village: "",
      "Farm Size (Hectares)": 1.5,
      "Water Source": "rainwater",
    });

    const notes = workbook.addWorksheet("Instructions");
    notes.columns = [{ header: "Instructions", key: "note", width: 90 }];
    notes.getRow(1).font = { bold: true };
    [
      "Full Name, Phone, District and Sector are required for every row.",
      "Phone must be a valid Rwandan number (e.g. 0788123456).",
      "Farm Size (Hectares) must be a positive number if provided.",
      `Water Source, if provided, must be one of: ${VALID_WATER_SOURCES.join(", ")}.`,
      "Each imported farmer gets a new account with an auto-generated temporary password, shown after import.",
      "Remove the example row before uploading your real data.",
    ].forEach((note) => notes.addRow({ note }));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=farmer_import_template.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return next(error);
  }
};

interface ParsedFarmerRow {
  rowNumber: number;
  fullName: string;
  phone: string;
  district: string;
  sector: string;
  cell?: string;
  village?: string;
  farmSizeHectares?: number;
  waterSource?: string;
  errors: string[];
}

export const importFarmers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: { code: "NO_FILE", message: "No file uploaded" },
      } as ApiResponse<null>);
    }

    const cooperative = await prisma.cooperative.findFirst({ where: { id, deletedAt: null } });
    if (!cooperative) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Cooperative not found" },
      } as ApiResponse<null>);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return res.status(400).json({
        success: false,
        error: { code: "EMPTY_FILE", message: "The uploaded file has no worksheet" },
      } as ApiResponse<null>);
    }

    const parsed: ParsedFarmerRow[] = [];
    const seenPhones = new Set<string>();

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // header row
      const values = row.values as any[];
      const fullName = String(values[1] ?? "").trim();
      const rawPhone = String(values[2] ?? "").trim();
      const district = String(values[3] ?? "").trim();
      const sector = String(values[4] ?? "").trim();
      const cell = values[5] ? String(values[5]).trim() : undefined;
      const village = values[6] ? String(values[6]).trim() : undefined;
      const farmSizeRaw = values[7];
      const waterSourceRaw = values[8] ? String(values[8]).trim().toLowerCase() : undefined;

      // Skip fully blank rows
      if (!fullName && !rawPhone && !district && !sector) return;

      const errors: string[] = [];
      if (!fullName) errors.push("Full name is required");

      const phone = normalizePhone(rawPhone);
      if (!phone || !/^2507[2389]\d{7}$/.test(phone)) {
        errors.push("Invalid phone number");
      } else if (seenPhones.has(phone)) {
        errors.push("Duplicate phone number within file");
      } else {
        seenPhones.add(phone);
      }

      if (!district) errors.push("District is required");
      if (!sector) errors.push("Sector is required");

      let farmSizeHectares: number | undefined;
      if (farmSizeRaw !== undefined && farmSizeRaw !== null && farmSizeRaw !== "") {
        farmSizeHectares = Number(farmSizeRaw);
        if (Number.isNaN(farmSizeHectares) || farmSizeHectares <= 0) {
          errors.push("Farm size must be a positive number");
        }
      }

      let waterSource: string | undefined;
      if (waterSourceRaw) {
        if (!VALID_WATER_SOURCES.includes(waterSourceRaw)) {
          errors.push(`Water source must be one of: ${VALID_WATER_SOURCES.join(", ")}`);
        } else {
          waterSource = waterSourceRaw;
        }
      }

      parsed.push({
        rowNumber,
        fullName,
        phone,
        district,
        sector,
        cell,
        village,
        farmSizeHectares,
        waterSource,
        errors,
      });
    });

    if (parsed.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "EMPTY_FILE", message: "No data rows found in file" },
      } as ApiResponse<null>);
    }

    // Check phones against existing users
    const candidatePhones = parsed.filter((p) => p.phone).map((p) => p.phone);
    const existingUsers = await prisma.user.findMany({
      where: { phone: { in: candidatePhones } },
      select: { phone: true },
    });
    const existingPhoneSet = new Set(existingUsers.map((u) => u.phone));
    for (const p of parsed) {
      if (p.phone && existingPhoneSet.has(p.phone)) {
        p.errors.push("Phone number already registered");
      }
    }

    const rowsWithErrors = parsed.filter((p) => p.errors.length > 0);
    if (rowsWithErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: `${rowsWithErrors.length} row(s) have errors. Fix them and re-upload — nothing was imported.`,
          details: rowsWithErrors.map((r) => ({
            row: r.rowNumber,
            fullName: r.fullName || undefined,
            errors: r.errors,
          })),
        },
      });
    }

    const created = await prisma.$transaction(async (tx) => {
      const results: { id: string; fullName: string; phone: string; tempPassword: string }[] = [];
      for (const p of parsed) {
        const tempPassword = crypto.randomBytes(6).toString("hex");
        const passwordHash = await argon2.hash(tempPassword);

        const user = await tx.user.create({
          data: {
            phone: p.phone,
            fullName: p.fullName,
            passwordHash,
            role: "farmer",
            status: "active",
            requiresPasswordChange: true,
          },
        });

        await tx.farmerProfile.create({
          data: {
            userId: user.id,
            fullName: p.fullName,
            district: p.district,
            sector: p.sector,
            cell: p.cell,
            village: p.village,
            farmSizeHectares: p.farmSizeHectares,
            waterSource: p.waterSource as any,
            cooperativeId: id,
          },
        });

        await tx.cooperativeMember.create({
          data: { userId: user.id, cooperativeId: id, role: "member", status: "active" },
        });

        results.push({ id: user.id, fullName: p.fullName, phone: p.phone, tempPassword });
      }
      return results;
    });

    if (req.user?.sub) {
      await auditService.logWithSnapshot({
        userId: req.user.sub,
        action: "BULK_IMPORT_FARMERS",
        module: "COOPERATIVE",
        resourceId: id,
        before: null,
        after: { imported: created.length },
      });
    }

    // Best-effort: text each new farmer their login credentials. SMS delivery
    // is external I/O with its own failure modes (unconfigured, sandbox mode,
    // carrier rejection) — never let it fail the import, which already
    // committed. Report per-farmer status so the manager knows who still
    // needs credentials shared manually.
    const smsConfigured = smsService.isConfigured();
    const farmersWithSmsStatus = [];
    for (const farmer of created) {
      let smsSent = false;
      let smsError: string | undefined = smsConfigured
        ? undefined
        : "SMS not configured";
      if (smsConfigured) {
        const message = `Welcome to AGUKA! Login: ${farmer.phone} Temp password: ${farmer.tempPassword} You'll be asked to change it after signing in.`;
        const result = await smsService.sendSms(farmer.phone, message);
        smsSent = result.success;
        smsError = result.success ? undefined : result.error;
      }
      farmersWithSmsStatus.push({ ...farmer, smsSent, smsError });
    }

    return res.status(201).json({
      success: true,
      data: {
        imported: created.length,
        farmers: farmersWithSmsStatus,
        smsConfigured,
        smsSandbox: smsConfigured ? smsService.isSandbox() : false,
      },
    });
  } catch (error) {
    return next(error);
  }
};
