import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../prisma.js";

export class AuditService {
  /**
   * Get paginated audit logs with advanced filtering
   */
  async getLogs(params: {
    page?: number;
    limit?: number;
    userId?: string;
    role?: UserRole;
    module?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.module) where.resourceType = params.module;
    if (params.action)
      where.action = { contains: params.action, mode: "insensitive" };

    if (params.role) {
      where.user = { role: params.role };
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {
        gte: params.startDate ? new Date(params.startDate) : undefined,
        lte: params.endDate ? new Date(params.endDate) : undefined,
      };
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              phone: true,
              role: true,
              farmerProfile: { select: { fullName: true } },
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get the most recent activity for the global header dropdown
   */
  async getRecentActivity(limit = 5) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            phone: true,
            farmerProfile: { select: { fullName: true } },
          },
        },
      },
    });
  }

  /**
   * Create a snapshot-based audit log
   */
  async logWithSnapshot(params: {
    userId: string;
    action: string;
    module: string;
    resourceId: string;
    before?: any;
    after?: any;
    ip?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resourceType: params.module,
        resourceId: params.resourceId,
        oldValue: params.before || null,
        newValue: params.after || null,
        ipAddress: params.ip,
        userAgent: params.userAgent,
      },
    });
  }
  /**
   * Create a simple audit log for actions without snapshots
   */
  async logAction(params: {
    userId: string;
    action: string;
    module: string;
    resourceId: string;
    details?: string;
    ip?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resourceType: params.module,
        resourceId: params.resourceId,
        oldValue: params.details
          ? { details: params.details }
          : Prisma.JsonNull,
        ipAddress: params.ip,
        userAgent: params.userAgent,
      },
    });
  }
}

export const auditService = new AuditService();
