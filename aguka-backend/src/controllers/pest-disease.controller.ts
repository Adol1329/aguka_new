import { Request, Response, NextFunction } from "express";
import {
  JwtPayload,
  AlertType,
  AlertSeverity,
  UserRole,
} from "../types/index.js";
import { auditService } from "../services/audit.service.js";
import { prisma } from "../prisma.js";

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Get pest and disease alerts for farmers in a cooperative or assigned to officer
 */
export const getPestDiseaseAlerts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params; // cooperativeId or farmerId
    const { severity, limit = "10" } = req.query;

    // Determine if user is requesting for cooperative or specific farmer
    let where: any = {
      alertType: { in: ["pest", "disease"] as AlertType[] },
    };

    // Check if user is extension officer, admin, or cooperative manager
    if (
      req.user?.role === UserRole.OFFICER ||
      req.user?.role === UserRole.ADMIN ||
      req.user?.role === UserRole.SUPER_ADMIN ||
      req.user?.role === UserRole.COOPERATIVE
    ) {
      // Get all pest/disease alerts for cooperative
      where.farmerId = {
        in: await prisma.farmerProfile
          .findMany({
            where: { cooperativeId: id },
            select: { id: true },
          })
          .then((farmers) => farmers.map((f) => f.id)),
      };
    } else if (req.user?.role === "farmer") {
      // Farmer can only see their own alerts
      where.farmerId = req.user.sub;
    } else {
      throw new Error("Unauthorized");
    }

    if (severity) {
      where.severity = severity as AlertSeverity;
    }

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        farmer: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: Number(limit),
    });

    return res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    return next(error);
  }
};

export const getOfficerPestDiseaseAlerts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { severity, limit = "50" } = req.query;
    const assignments = await prisma.extensionOfficerAssignment.findMany({
      where: { extensionOfficerId: req.user!.sub },
      select: { farmerId: true },
    });
    const assignedUserIds = assignments.map((a) => a.farmerId);
    const profiles = await prisma.farmerProfile.findMany({
      where: { userId: { in: assignedUserIds } },
      select: { id: true },
    });

    const where: any = {
      farmerId: { in: profiles.map((p) => p.id) },
      alertType: { in: ["pest", "disease"] as AlertType[] },
    };

    if (severity) {
      where.severity = severity as AlertSeverity;
    }

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        farmer: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            district: true,
            sector: true,
            farmName: true,
            user: {
              select: { phone: true, fullName: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: Number(limit),
    });

    return res.json({ success: true, data: alerts });
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a new pest or disease alert (by extension officer or system)
 */
export const createPestDiseaseAlert = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { farmerId, alertType, severity, title, message, recommendation } =
      req.body;

    // Validate alertType
    if (!["pest", "disease"].includes(alertType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Alert type must be either 'pest' or 'disease'",
        },
      });
    }

    // Verify farmer exists
    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Farmer not found",
        },
      });
    }

    // Check permissions: officer assigned to farmer, admin, or system
    const isAssignedOfficer =
      req.user?.role === "officer" &&
      (await prisma.extensionOfficerAssignment.findFirst({
        where: {
          extensionOfficerId: req.user.sub,
          farmerId: farmer.userId,
        },
      }));

    const isAdmin =
      req.user?.role === "admin" || req.user?.role === "super_admin";

    if (!isAssignedOfficer && !isAdmin && req.user?.sub !== farmerId) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions to create alert for this farmer",
        },
      });
    }

    const alert = await prisma.alert.create({
      data: {
        farmerId,
        alertType: alertType as AlertType,
        severity: severity as AlertSeverity,
        title,
        message,
        recommendation,
        createdById: req.user?.sub,
      },
    });

    // Log audit
    await auditService.logWithSnapshot({
      userId: req.user!.sub,
      action: "CREATE_PEST_DISEASE_ALERT",
      module: "PEST_DISEASE_MANAGEMENT",
      resourceId: alert.id,
      before: null,
      after: alert,
    });

    // Send notification (via notification service would be called here)
    // For now, we'll just create the alert

    return res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update pest/disease alert status (mark as read, etc.)
 */
export const updatePestDiseaseAlert = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { alertId } = req.params;
    const { isRead } = req.body;

    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        farmer: true,
      },
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Alert not found",
        },
      });
    }

    // Check permissions
    const isAssignedOfficer =
      req.user?.role === "officer" &&
      (await prisma.extensionOfficerAssignment.findFirst({
        where: {
          extensionOfficerId: req.user.sub,
          farmerId: alert.farmer.userId,
        },
      }));

    const isAdmin =
      req.user?.role === "admin" || req.user?.role === "super_admin";
    const isFarmerOwner = req.user?.sub === alert.farmerId;

    if (!isAssignedOfficer && !isAdmin && !isFarmerOwner) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions to update this alert",
        },
      });
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        isRead: isRead ?? alert.isRead,
      },
    });

    // Log audit
    await auditService.logWithSnapshot({
      userId: req.user!.sub,
      action: "UPDATE_PEST_DISEASE_ALERT",
      module: "PEST_DISEASE_MANAGEMENT",
      resourceId: alertId,
      before: alert,
      after: updatedAlert,
    });

    return res.json({
      success: true,
      data: updatedAlert,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get pest/disease statistics for dashboard
 */
export const getPestDiseaseStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params; // cooperativeId
    const { days = "30" } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get farmer IDs in cooperative
    const farmerIds = await prisma.farmerProfile
      .findMany({
        where: { cooperativeId: id },
        select: { id: true },
      })
      .then((farmers) => farmers.map((f) => f.id));

    const [pestAlerts, diseaseAlerts, activeAlerts] = await Promise.all([
      prisma.alert.count({
        where: {
          farmerId: { in: farmerIds },
          alertType: "pest",
          createdAt: { gte: startDate },
        },
      }),
      prisma.alert.count({
        where: {
          farmerId: { in: farmerIds },
          alertType: "disease",
          createdAt: { gte: startDate },
        },
      }),
      prisma.alert.count({
        where: {
          farmerId: { in: farmerIds },
          alertType: { in: ["pest", "disease"] },
          isRead: false,
          createdAt: { gte: startDate },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        pestAlerts,
        diseaseAlerts,
        activeAlerts,
        periodDays: Number(days),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getPestDiseaseAlerts,
  createPestDiseaseAlert,
  updatePestDiseaseAlert,
  getPestDiseaseStats,
};
