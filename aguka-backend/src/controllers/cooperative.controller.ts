import { Request, Response, NextFunction } from "express";
import { ApiResponse, JwtPayload, UserRole } from "../types/index.js";
import { auditService } from "../services/audit.service.js";
import { cooperativeService } from "../services/cooperative.service.js";
import { prisma } from "../prisma.js";

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

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

    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId },
      include: { cooperative: true },
    });

    if (!farmerProfile?.cooperativeId) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Cooperative not found" },
      } as ApiResponse<null>);
    }

    const cooperative = await prisma.cooperative.findUnique({
      where: { id: farmerProfile.cooperativeId },
      include: {
        _count: {
          select: { farmers: true },
        },
      },
    });

    return res.json({
      success: true,
      data: {
        ...cooperative,
        memberCount: cooperative?._count.farmers || 0,
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

    const cooperative = await prisma.cooperative.findUnique({
      where: { id },
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
    const pendingRequests = await prisma.resourceBooking.count({
      where: {
        resource: { cooperativeId: id },
        status: "pending",
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
        pendingRequests,
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
    const updates = req.body;

    if (updates.scheduledAt) {
      updates.scheduledAt = new Date(updates.scheduledAt);
    }

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
    const { type, available } = req.query;

    const where: any = { cooperativeId: id };

    if (type && type !== "all") {
      where.resourceType = type;
    }
    if (available !== undefined) {
      where.isAvailable = available === "true";
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
      resourceType,
      quantity,
      unit,
      condition,
      location,
    } = req.body;

    const resource = await prisma.resource.create({
      data: {
        cooperativeId: id,
        name,
        description,
        resourceType,
        quantity,
        unit,
        condition,
        location,
        availableQuantity: quantity,
        isAvailable: true,
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
    const updates = req.body;

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

export const bookResource = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { resourceId } = req.params;
    const { quantity, startDate, endDate, notes } = req.body;

    const booking = await prisma.resourceBooking.create({
      data: {
        resourceId,
        memberId: req.user?.sub || "",
        quantity,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes,
        status: "pending",
      },
    });

    return res.status(201).json({ success: true, data: booking });
  } catch (error) {
    return next(error);
  }
};

export const getResourceBookings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const bookings = await prisma.resourceBooking.findMany({
      where: {
        resource: { cooperativeId: id },
        ...(status && status !== "all" ? { status: status as string } : {}),
      },
      include: {
        resource: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: bookings });
  } catch (error) {
    return next(error);
  }
};

export const approveBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.resourceBooking.update({
      where: { id: bookingId },
      data: { status: "approved" },
    });

    return res.json({ success: true, data: booking });
  } catch (error) {
    return next(error);
  }
};

export const rejectBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.resourceBooking.update({
      where: { id: bookingId },
      data: { status: "rejected" },
    });

    return res.json({ success: true, data: booking });
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
    const updates = req.body;

    if (updates.harvestDate) {
      updates.harvestDate = new Date(updates.harvestDate);
    }

    if (updates.quantity && updates.pricePerUnit) {
      updates.totalPrice =
        Number(updates.quantity) * Number(updates.pricePerUnit);
      updates.availableQuantity = updates.quantity;
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

export const getBulkOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const orders = await prisma.bulkOrder.findMany({
      where: { cooperativeId: id },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: orders });
  } catch (error) {
    return next(error);
  }
};

export const createBulkOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const {
      productName,
      supplier,
      quantity,
      unit,
      unitPrice,
      expectedDelivery,
    } = req.body;

    const totalPrice = Number(quantity) * Number(unitPrice);

    const order = await prisma.bulkOrder.create({
      data: {
        cooperativeId: id,
        productName,
        supplier,
        quantity,
        unit: unit || "kg",
        unitPrice,
        totalPrice,
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
        status: "pending",
      },
    });

    return res.status(201).json({ success: true, data: order });
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
    
    // Allow access if user is admin/super_admin or belongs to the cooperative
    const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
    const isMember = farmerProfile?.cooperativeId === id;
    
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
    
    const performanceData = await cooperativeService.getFarmerPerformanceComparison(
      id,
      startDate,
      endDate
    );
    
    return res.json({ success: true, data: performanceData });
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
      const performanceData = await cooperativeService.getFarmerPerformanceComparison(
        cooperativeId,
        start,
        end
      );
      
      return {
        totalMembers: performanceData.rankings.length,
        activeMembers: performanceData.rankings.filter(farmer => 
          farmer.soilMoistureAvg !== null || 
          farmer.activitiesCount > 0 || 
          farmer.irrigationCount > 0
        ).length,
        memberGrowth: 0, // This would require historical data to calculate properly
        averageScore: performanceData.averageScore,
        topPerformer: performanceData.topPerformer ? 
          `${performanceData.topPerformer.fullName} (${performanceData.topPerformer.overallScore.toFixed(1)}%)` : 
          "None",
        performanceDetails: performanceData.rankings.map(farmer => ({
          id: farmer.id,
          name: farmer.fullName,
          district: farmer.district,
          farmName: farmer.farmName,
          soilMoistureAvg: farmer.soilMoistureAvg,
          activitiesCount: farmer.activitiesCount,
          irrigationCount: farmer.irrigationCount,
          overallScore: farmer.overallScore
        }))
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
            cooperativeId
          },
          readingAt: {
            gte: start,
            lte: end
          }
        },
        include: {
          farmer: {
            select: {
              id: true,
              fullName: true,
              farmName: true
            }
          }
        },
        orderBy: {
          readingAt: 'desc'
        }
      });
      
      // Calculate averages
      const avgMoisture = soilReadings.length > 0 
        ? soilReadings.reduce((sum, r) => sum + Number(r.moisturePercent || 0), 0) / soilReadings.length
        : 0;
        
      const avgTemperature = soilReadings.length > 0 
        ? soilReadings.reduce((sum, r) => sum + Number(r.temperatureCelsius || 0), 0) / soilReadings.length
        : 0;
        
      const avgPh = soilReadings.length > 0 
        ? soilReadings.reduce((sum, r) => sum + Number(r.phLevel || 0), 0) / soilReadings.length
        : 0;
      
      return {
        totalReadings: soilReadings.length,
        averageMoisture: Number(avgMoisture.toFixed(2)),
        averageTemperature: Number(avgTemperature.toFixed(2)),
        averagePh: Number(avgPh.toFixed(2)),
        readings: soilReadings.map(reading => ({
          id: reading.id,
          farmerName: reading.farmer.fullName,
          farmName: reading.farmer.farmName,
          moisturePercent: Number(reading.moisturePercent || 0),
          temperatureCelsius: reading.temperatureCelsius ? Number(reading.temperatureCelsius) : null,
          phLevel: reading.phLevel ? Number(reading.phLevel) : null,
          readingAt: reading.readingAt
        }))
      };
    }

    case "activity": {
      // Query real farm activities for the cooperative's farmers in the date range
      const activities = await prisma.farmActivity.findMany({
        where: {
          farmer: {
            cooperativeId
          },
          activityDate: {
            gte: start,
            lte: end
          }
        },
        include: {
          farmer: {
            select: {
              id: true,
              fullName: true,
              farmName: true
            }
          }
        },
        orderBy: {
          activityDate: 'desc'
        }
      });
      
      // Group by activity type
      const activitiesByType = activities.reduce((acc, activity) => {
        const type = activity.activityType || 'other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        totalActivities: activities.length,
        activitiesByType,
        activities: activities.map(activity => ({
          id: activity.id,
          farmerName: activity.farmer.fullName,
          farmName: activity.farmer.farmName,
          activityType: activity.activityType,
          category: activity.category,
          quantity: activity.quantity,
          unit: activity.unit,
          costRwf: activity.costRwf,
          activityDate: activity.activityDate
        }))
      };
    }

    case "financial": {
      // Query real payment records for the cooperative's farmers
      const payments = await prisma.payment.findMany({
        where: {
          user: {
            farmerProfile: {
              cooperativeId
            }
          },
          createdAt: {
            gte: start,
            lte: end
          },
          status: {
            not: "pending" // Only count completed/failed payments
          }
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true
            }
          }
        }
      });
      
      if (payments.length === 0) {
        return { 
          message: 'No payment data available for the selected period' 
        };
      }
      
      const totalAmount = payments.reduce((sum, payment) => 
        sum + Number(payment.amount || 0), 0);
        
      const successfulPayments = payments.filter(p => 
        p.status === 'completed' || p.status === 'processed'
      );
      
      const successfulAmount = successfulPayments.reduce((sum, payment) => 
        sum + Number(payment.amount || 0), 0);
      
      return {
        totalPayments: payments.length,
        successfulPayments: successfulPayments.length,
        totalAmount: Number(totalAmount.toFixed(2)),
        successfulAmount: Number(successfulAmount.toFixed(2)),
        averagePayment: payments.length > 0 
          ? Number((totalAmount / payments.length).toFixed(2)) 
          : 0,
        payments: payments.map(payment => ({
          id: payment.id,
          userName: payment.user.fullName,
          userPhone: payment.user.phone,
          amount: Number(payment.amount || 0),
          currency: payment.currency,
          paymentType: payment.paymentType,
          status: payment.status,
          createdAt: payment.createdAt
        }))
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
