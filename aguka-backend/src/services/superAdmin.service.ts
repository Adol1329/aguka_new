import argon2 from "argon2";
import { auditService } from "./audit.service.js";
import { prisma } from "../prisma.js";
import {
  createDatabaseBackup,
  getBackupDownloadPath,
  restoreDatabaseBackup,
} from "./backup.service.js";
import { invalidatePermissionCache } from "../utils/permissionCache.js";

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    "*",
    "manage_users",
    "manage_roles",
    "manage_settings",
    "view_audit_logs",
    "manage_backups",
    "manage_all_data",
    "broadcast_notifications",
  ],
  admin: [
    "manage_users",
    "manage_settings",
    "view_audit_logs",
    "manage_all_data",
    "broadcast_notifications",
    "view_reports",
  ],
  officer: ["manage_assigned_farmers", "send_advisories", "view_reports"],
  cooperative: [
    "manage_cooperative_members",
    "manage_resources",
    "schedule_events",
    "view_reports",
  ],
  farmer: [
    "view_own_farm",
    "log_activities",
    "view_advisories",
    "view_weather",
    "view_market_prices",
  ],
};

export class SuperAdminService {
  async getDashboardStats() {
    const [
      totalUsers,
      totalFarmers,
      totalCoops,
      totalSensors,
      activeSensors,
      totalCrops,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "farmer" } }),
      prisma.cooperative.count(),
      prisma.sensor.count(),
      prisma.sensor.count({ where: { isActive: true } }),
      prisma.crop.count({ where: { isActive: true } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, phone: true, role: true, createdAt: true },
      }),
    ]);

    return {
      totalUsers,
      totalFarmers,
      totalCoops,
      totalSensors,
      activeSensors,
      sensorUptime:
        totalSensors > 0 ? Math.round((activeSensors / totalSensors) * 100) : 0,
      totalCrops,
      recentUsers,
    };
  }

  async getAllUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    status?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.role) where.role = params.role;
    if (params.status === "active") where.isActive = true;
    if (params.status === "inactive") where.isActive = false;
    if (params.search) {
      where.OR = [
        { phone: { contains: params.search } },
        { email: { contains: params.search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          phone: true,
          email: true,
          fullName: true,
          role: true,
          language: true,
          status: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          farmerProfile: { select: { fullName: true, district: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
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

  async createUser(data: {
    phone: string;
    email?: string;
    password?: string;
    role: string;
    fullName: string;
    district: string;
    sector: string;
  }) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          ...(data.email ? [{ email: data.email }] : []),
        ],
      },
    });

    if (existing) {
      throw new Error("User with this phone or email already exists");
    }

    const passwordHash = data.password
      ? await argon2.hash(data.password)
      : null;

    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        email: data.email,
        passwordHash,
        role: data.role as any,
      },
    });

    await prisma.farmerProfile.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        district: data.district,
        sector: data.sector,
        location: data.district,
      },
    });

    return user;
  }

  async updateUser(
    userId: string,
    data: { role?: string; isActive?: boolean; language?: string },
    adminId?: string,
  ) {
    if (adminId && userId === adminId) {
      if (data.isActive === false) {
        throw new Error("You cannot suspend your own account");
      }
      if (data.role) {
        throw new Error("You cannot change your own role");
      }
    }

    // 📸 CAPTURE BEFORE STATE
    const before = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true, language: true, status: true },
    });

    const updateData: any = {};
    if (data.role) updateData.role = data.role;
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
      updateData.status = data.isActive ? "active" : "suspended";
    }
    if (data.language) updateData.language = data.language;

    const after = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { role: true, isActive: true, language: true, status: true },
    });

    // 📜 LOG AUDIT WITH SNAPSHOT
    if (adminId) {
      await auditService.logWithSnapshot({
        userId: adminId,
        action: "UPDATE_USER",
        module: "USER_MANAGEMENT",
        resourceId: userId,
        before,
        after,
      });
    }

    return after;
  }

  async deleteUser(userId: string, adminId?: string) {
    if (adminId && userId === adminId) {
      throw new Error("You cannot purge your own account");
    }

    // 📸 CAPTURE BEFORE STATE
    const before = await prisma.user.findUnique({
      where: { id: userId },
    });

    const result = await prisma.user.delete({ where: { id: userId } });

    // 📜 LOG AUDIT
    if (adminId) {
      await auditService.logWithSnapshot({
        userId: adminId,
        action: "DELETE_USER",
        module: "USER_MANAGEMENT",
        resourceId: userId,
        before,
        after: null,
      });
    }

    return result;
  }

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = { contains: params.action };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { phone: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
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

  async getSystemHealth() {
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeFormatted = [
      days > 0 ? `${days}d` : null,
      hours > 0 ? `${hours}h` : null,
      `${minutes}m`,
    ]
      .filter(Boolean)
      .join(" ");

    const sensorCount = await prisma.sensor.count();
    const activeSensors = await prisma.sensor.count({
      where: { isActive: true },
    });

    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const memPercent = Math.round(
      (memUsage.heapUsed / memUsage.heapTotal) * 100,
    );

    return {
      api: { status: "healthy", uptime: uptimeFormatted, uptimeSeconds },
      database: { status: "connected", provider: "postgresql" },
      sensors: {
        total: sensorCount,
        active: activeSensors,
        health:
          sensorCount > 0 ? Math.round((activeSensors / sensorCount) * 100) : 0,
      },
      memory: {
        usage: `${heapUsedMB}MB`,
        usedMB: heapUsedMB,
        totalMB: heapTotalMB,
        percent: memPercent,
      },
      platform: {
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
      },
    };
  }

  async getReports() {
    const farmers = await prisma.user.count({ where: { role: "farmer" } });
    const officers = await prisma.user.count({ where: { role: "officer" } });
    const coops = await prisma.cooperative.count();
    const sensors = await prisma.sensor.count();
    const activeSensors = await prisma.sensor.count({
      where: { isActive: true },
    });

    return {
      summary: {
        totalFarmers: farmers,
        totalOfficers: officers,
        totalCooperatives: coops,
        totalSensors: sensors,
        activeSensors: activeSensors,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  async getCooperatives() {
    return prisma.cooperative.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { farmers: true } },
      },
    });
  }

  async getBackups() {
    const backups = await prisma.backup.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const totalSize = backups.reduce((sum, b) => sum + (b.sizeBytes || 0), 0);
    const lastBackup = backups[0] || null;

    return {
      backups,
      totalSize,
      lastBackup,
    };
  }

  async createBackup(creatorId: string) {
    return createDatabaseBackup(creatorId);
  }

  async deleteBackup(backupId: string) {
    return prisma.backup.delete({ where: { id: backupId } });
  }

  async restoreBackup(backupId: string) {
    return restoreDatabaseBackup(backupId);
  }

  async getBackupDownload(backupId: string) {
    return getBackupDownloadPath(backupId);
  }

  async getSystemSettings() {
    const settings = await prisma.systemSetting.findMany();
    const result: Record<string, unknown> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async updateSystemSetting(key: string, value: string) {
    return prisma.systemSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async updateSystemSettings(settings: Record<string, unknown>) {
    const entries = Object.entries(settings);

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.systemSetting.upsert({
          where: { key },
          create: { key, value: JSON.stringify(value) },
          update: { value: JSON.stringify(value) },
        }),
      ),
    );

    return this.getSystemSettings();
  }

  async getRoles() {
    const roleCounts = await prisma.user.groupBy({
      by: ["role"],
      _count: true,
    });

    // Build a lookup of actual user counts per role
    const countMap: Record<string, number> = {};
    roleCounts.forEach((r) => {
      countMap[r.role] = r._count;
    });

    const savedPermissions = await prisma.systemSetting.findUnique({
      where: { key: "role_permissions" },
    });
    const rolePermissions = savedPermissions?.value
      ? (JSON.parse(savedPermissions.value) as Record<string, string[]>)
      : DEFAULT_ROLE_PERMISSIONS;

    // Always return ALL system roles, even those with 0 users
    const allSystemRoles: Array<{
      role: string;
      label: string;
      description: string;
    }> = [
      {
        role: "super_admin",
        label: "Super Admin",
        description:
          "Full system access — unrestricted control over all modules",
      },
      {
        role: "admin",
        label: "Administrator",
        description: "Manages users, data, and system notifications",
      },
      {
        role: "officer",
        label: "Extension Officer",
        description: "Guides and monitors assigned farmers in the field",
      },
      {
        role: "cooperative",
        label: "Cooperative Manager",
        description: "Manages cooperative members, resources, and events",
      },
      {
        role: "farmer",
        label: "Farmer",
        description: "Access to own farm data, advisories, and market info",
      },
    ];

    return allSystemRoles.map(({ role, label, description }) => ({
      role,
      label,
      description,
      userCount: countMap[role] ?? 0,
      permissions: rolePermissions[role] || [],
    }));
  }

  async updateRolePermissions(role: string, permissions: string[]) {
    const savedPermissions = await prisma.systemSetting.findUnique({
      where: { key: "role_permissions" },
    });
    const current = savedPermissions?.value
      ? (JSON.parse(savedPermissions.value) as Record<string, string[]>)
      : DEFAULT_ROLE_PERMISSIONS;

    const next = { ...current, [role]: permissions };
    const result = await this.updateSystemSetting(
      "role_permissions",
      JSON.stringify(next),
    );
    invalidatePermissionCache();
    return result;
  }
}

export const superAdminService = new SuperAdminService();
