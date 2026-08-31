import crypto from "crypto";
import fs from "fs";
import argon2 from "argon2";
import { auditService } from "./audit.service.js";
import { prisma } from "../prisma.js";
import {
  createDatabaseBackup,
  getBackupDownloadPath,
  restoreDatabaseBackup,
} from "./backup.service.js";
import { invalidatePermissionCache } from "../utils/permissionCache.js";
import { normalizePhone } from "../utils/phone.js";

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
    const normalizedPhone = normalizePhone(data.phone);
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
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
        phone: normalizedPhone,
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

    // 📸 CAPTURE BEFORE STATE (exclude passwordHash from audit)
    const raw = await prisma.user.findUnique({
      where: { id: userId },
    });
    const { passwordHash: _pw, ...before } = raw!;

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

  async getBackupSchedule() {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "backup_schedule" },
    });
    return setting?.value ? JSON.parse(setting.value) : null;
  }

  async saveBackupSchedule(schedule: {
    enabled: boolean;
    frequency: string;
    time: string;
    retention: string;
  }) {
    await prisma.systemSetting.upsert({
      where: { key: "backup_schedule" },
      create: { key: "backup_schedule", value: JSON.stringify(schedule) },
      update: { value: JSON.stringify(schedule) },
    });
    return schedule;
  }

  async getCustomRoles() {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "custom_roles" },
    });
    return setting?.value ? JSON.parse(setting.value) : [];
  }

  async saveCustomRoles(
    roles: Array<{
      role: string;
      label: string;
      description: string;
      permissions: string[];
    }>,
  ) {
    await prisma.systemSetting.upsert({
      where: { key: "custom_roles" },
      create: { key: "custom_roles", value: JSON.stringify(roles) },
      update: { value: JSON.stringify(roles) },
    });
    return roles;
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
    const backup = await prisma.backup.findUnique({ where: { id: backupId } });
    const result = await prisma.backup.delete({ where: { id: backupId } });
    if (backup?.filePath && fs.existsSync(backup.filePath)) {
      try {
        fs.unlinkSync(backup.filePath);
      } catch {
        // file already deleted or inaccessible — non-critical
      }
    }
    return result;
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

  async updateSystemSetting(key: string, value: string, userId?: string) {
    const result = await prisma.systemSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    if (userId) {
      await auditService
        .logAction({
          userId,
          action: "UPDATE_SYSTEM_SETTING",
          module: "SYSTEM_CONFIG",
          resourceId: key,
          details: `Set ${key}=${value}`,
        })
        .catch(() => {});
    }
    return result;
  }

  async updateSystemSettings(
    settings: Record<string, unknown>,
    userId?: string,
  ) {
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

    if (userId) {
      await auditService
        .logAction({
          userId,
          action: "UPDATE_SYSTEM_SETTINGS",
          module: "SYSTEM_CONFIG",
          resourceId: "bulk",
          details: `Updated ${entries.length} settings`,
        })
        .catch(() => {});
    }

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

  // --- FEATURE 1: MERGE DUPLICATE ACCOUNTS
  async mergeUsers(params: {
    primaryUserId: string;
    secondaryUserId: string;
    adminId: string;
  }) {
    const { primaryUserId, secondaryUserId, adminId } = params;

    if (primaryUserId === secondaryUserId) {
      throw new Error("Cannot merge a user with itself");
    }

    const primary = await prisma.user.findUnique({
      where: { id: primaryUserId },
    });
    const secondary = await prisma.user.findUnique({
      where: { id: secondaryUserId },
    });

    if (!primary || !secondary) {
      throw new Error("One or both users not found");
    }

    const secondaryProfile = await prisma.farmerProfile.findUnique({
      where: { userId: secondaryUserId },
    });
    const primaryProfile = await prisma.farmerProfile.findUnique({
      where: { userId: primaryUserId },
    });

    const mergedData: Record<string, any> = {
      secondaryUser: {
        id: secondary.id,
        phone: secondary.phone,
        role: secondary.role,
      },
      transferredRecords: {},
    };

    // Transfer farmer profile data if missing on primary
    if (secondaryProfile && primaryProfile) {
      const updates: any = {};
      if (!primaryProfile.fullName && secondaryProfile.fullName)
        updates.fullName = secondaryProfile.fullName;
      if (!primaryProfile.district && secondaryProfile.district)
        updates.district = secondaryProfile.district;
      if (!primaryProfile.sector && secondaryProfile.sector)
        updates.sector = secondaryProfile.sector;
      if (!primaryProfile.location && secondaryProfile.location)
        updates.location = secondaryProfile.location;
      if (Object.keys(updates).length > 0) {
        await prisma.farmerProfile.update({
          where: { userId: primaryUserId },
          data: updates,
        });
      }
    }

    // Transfer FarmActivity
    if (secondaryProfile) {
      const farmActivities = await prisma.farmActivity.findMany({
        where: { farmerId: secondaryProfile.id },
      });
      if (farmActivities.length > 0) {
        await prisma.farmActivity.updateMany({
          where: { farmerId: secondaryProfile.id },
          data: { farmerId: primaryProfile!.id },
        });
        mergedData.transferredRecords.farmActivities = farmActivities.length;
      }
    }

    // Transfer SoilReading
    if (secondaryProfile) {
      const soilReadings = await prisma.soilReading.findMany({
        where: { farmerId: secondaryProfile.id },
      });
      if (soilReadings.length > 0) {
        await prisma.soilReading.updateMany({
          where: { farmerId: secondaryProfile.id },
          data: { farmerId: primaryProfile!.id },
        });
        mergedData.transferredRecords.soilReadings = soilReadings.length;
      }
    }

    // Transfer WeatherReading
    if (secondaryProfile) {
      const weatherReadings = await prisma.weatherReading.findMany({
        where: { farmerId: secondaryProfile.id },
      });
      if (weatherReadings.length > 0) {
        await prisma.weatherReading.updateMany({
          where: { farmerId: secondaryProfile.id },
          data: { farmerId: primaryProfile!.id },
        });
        mergedData.transferredRecords.weatherReadings = weatherReadings.length;
      }
    }

    // Transfer IrrigationSchedule
    if (secondaryProfile) {
      const irrigationSchedules = await prisma.irrigationSchedule.findMany({
        where: { farmerId: secondaryProfile.id },
      });
      if (irrigationSchedules.length > 0) {
        await prisma.irrigationSchedule.updateMany({
          where: { farmerId: secondaryProfile.id },
          data: { farmerId: primaryProfile!.id },
        });
        mergedData.transferredRecords.irrigationSchedules =
          irrigationSchedules.length;
      }
    }

    // Transfer IrrigationLog
    if (secondaryProfile) {
      const irrigationLogs = await prisma.irrigationLog.findMany({
        where: { farmerId: secondaryProfile.id },
      });
      if (irrigationLogs.length > 0) {
        await prisma.irrigationLog.updateMany({
          where: { farmerId: secondaryProfile.id },
          data: { farmerId: primaryProfile!.id },
        });
        mergedData.transferredRecords.irrigationLogs = irrigationLogs.length;
      }
    }

    // Transfer IrrigationZone
    if (secondaryProfile) {
      const irrigationZones = await prisma.irrigationZone.findMany({
        where: { farmerId: secondaryProfile.id },
      });
      if (irrigationZones.length > 0) {
        await prisma.irrigationZone.updateMany({
          where: { farmerId: secondaryProfile.id },
          data: { farmerId: primaryProfile!.id },
        });
        mergedData.transferredRecords.irrigationZones = irrigationZones.length;
      }
    }

    // Transfer Sensor
    if (secondaryProfile) {
      const sensors = await prisma.sensor.findMany({
        where: { farmerId: secondaryProfile.id },
      });
      if (sensors.length > 0) {
        await prisma.sensor.updateMany({
          where: { farmerId: secondaryProfile.id },
          data: { farmerId: primaryProfile!.id },
        });
        mergedData.transferredRecords.sensors = sensors.length;
      }
    }

    // Transfer FarmerCrop
    if (secondaryProfile) {
      const farmerCrops = await prisma.farmerCrop.findMany({
        where: { farmerId: secondaryProfile.id },
      });
      if (farmerCrops.length > 0) {
        await prisma.farmerCrop.updateMany({
          where: { farmerId: secondaryProfile.id },
          data: { farmerId: primaryProfile!.id },
        });
        mergedData.transferredRecords.farmerCrops = farmerCrops.length;
      }
    }

    // Transfer Recommendation
    if (secondaryProfile) {
      const recommendations = await prisma.recommendation.findMany({
        where: { farmerId: secondaryProfile.id },
      });
      if (recommendations.length > 0) {
        await prisma.recommendation.updateMany({
          where: { farmerId: secondaryProfile.id },
          data: { farmerId: primaryProfile!.id },
        });
        mergedData.transferredRecords.recommendations = recommendations.length;
      }
    }

    // Transfer Alert
    if (secondaryProfile) {
      const alerts = await prisma.alert.findMany({
        where: { farmerId: secondaryProfile.id },
      });
      if (alerts.length > 0) {
        await prisma.alert.updateMany({
          where: { farmerId: secondaryProfile.id },
          data: { farmerId: primaryProfile!.id },
        });
        mergedData.transferredRecords.alerts = alerts.length;
      }
    }

    // Transfer Notification
    const notifications = await prisma.notification.findMany({
      where: { userId: secondaryUserId },
    });
    if (notifications.length > 0) {
      await prisma.notification.updateMany({
        where: { userId: secondaryUserId },
        data: { userId: primaryUserId },
      });
      mergedData.transferredRecords.notifications = notifications.length;
    }

    // Transfer ForumPost
    const forumPosts = await prisma.forumPost.findMany({
      where: { authorId: secondaryUserId },
    });
    if (forumPosts.length > 0) {
      await prisma.forumPost.updateMany({
        where: { authorId: secondaryUserId },
        data: { authorId: primaryUserId },
      });
      mergedData.transferredRecords.forumPosts = forumPosts.length;
    }

    // Transfer ForumComment
    const forumComments = await prisma.forumComment.findMany({
      where: { authorId: secondaryUserId },
    });
    if (forumComments.length > 0) {
      await prisma.forumComment.updateMany({
        where: { authorId: secondaryUserId },
        data: { authorId: primaryUserId },
      });
      mergedData.transferredRecords.forumComments = forumComments.length;
    }

    // Transfer FieldVisitNote
    if (secondaryProfile) {
      const fieldVisitNotes = await prisma.fieldVisitNote.findMany({
        where: { farmerId: secondaryProfile.id },
      });
      if (fieldVisitNotes.length > 0) {
        await prisma.fieldVisitNote.updateMany({
          where: { farmerId: secondaryProfile.id },
          data: { farmerId: primaryProfile!.id },
        });
        mergedData.transferredRecords.fieldVisitNotes = fieldVisitNotes.length;
      }
    }

    // Transfer FarmerFiles
    if (secondaryProfile) {
      const farmerFiles = await prisma.farmerFiles.findMany({
        where: { farmerId: secondaryProfile.id },
      });
      if (farmerFiles.length > 0) {
        await prisma.farmerFiles.updateMany({
          where: { farmerId: secondaryProfile.id },
          data: { farmerId: primaryProfile!.id },
        });
        mergedData.transferredRecords.farmerFiles = farmerFiles.length;
      }
    }

    // Transfer SupportTicket
    if (secondaryProfile) {
      const supportTickets = await prisma.supportTicket.findMany({
        where: { farmerId: secondaryProfile.id },
      });
      if (supportTickets.length > 0) {
        await prisma.supportTicket.updateMany({
          where: { farmerId: secondaryProfile.id },
          data: { farmerId: primaryProfile!.id },
        });
        mergedData.transferredRecords.supportTickets = supportTickets.length;
      }
    }

    // Transfer ExtensionOfficerAssignment (as farmer)
    const asFarmer = await prisma.extensionOfficerAssignment.findMany({
      where: { farmerId: secondaryUserId },
    });
    if (asFarmer.length > 0) {
      await prisma.extensionOfficerAssignment.updateMany({
        where: { farmerId: secondaryUserId },
        data: { farmerId: primaryUserId },
      });
      mergedData.transferredRecords.extensionAssignments = asFarmer.length;
    }

    // Transfer CooperativeMember
    const coopMember = await prisma.cooperativeMember.findUnique({
      where: { userId: secondaryUserId },
    });
    if (coopMember) {
      const existingPrimary = await prisma.cooperativeMember.findUnique({
        where: { userId: primaryUserId },
      });
      if (!existingPrimary) {
        await prisma.cooperativeMember.update({
          where: { userId: secondaryUserId },
          data: { userId: primaryUserId },
        });
      }
      mergedData.transferredRecords.cooperativeMember = true;
    }

    // Transfer Devices
    const devices = await prisma.device.findMany({
      where: { userId: secondaryUserId },
    });
    if (devices.length > 0) {
      await prisma.device.updateMany({
        where: { userId: secondaryUserId },
        data: { userId: primaryUserId },
      });
      mergedData.transferredRecords.devices = devices.length;
    }

    // Remove duplicate FCM tokens
    const primaryFcmTokens = await prisma.device.findMany({
      where: { userId: primaryUserId },
      select: { fcmToken: true },
    });
    const primaryTokens = new Set(primaryFcmTokens.map((d) => d.fcmToken));
    const duplicates = await prisma.device.findMany({
      where: {
        userId: primaryUserId,
        fcmToken: { in: Array.from(primaryTokens) },
      },
    });
    if (duplicates.length > 1) {
      const keep = new Set<string>();
      const toDelete: string[] = [];
      for (const d of duplicates) {
        if (keep.has(d.fcmToken)) toDelete.push(d.id);
        else keep.add(d.fcmToken);
      }
      if (toDelete.length > 0) {
        await prisma.device.deleteMany({ where: { id: { in: toDelete } } });
      }
    }

    // Soft delete secondary user
    await prisma.user.update({
      where: { id: secondaryUserId },
      data: { deletedAt: new Date(), isActive: false, status: "suspended" },
    });

    // Create merge log
    await prisma.userMergeLog.create({
      data: {
        primaryUserId,
        secondaryUserId,
        mergedData: mergedData as any,
        mergedBy: adminId,
      },
    });

    // Audit log
    await auditService.logWithSnapshot({
      userId: adminId,
      action: "MERGE_USERS",
      module: "USER_MANAGEMENT",
      resourceId: primaryUserId,
      before: { secondaryUserId, secondaryPhone: secondary.phone },
      after: { mergedData },
    });

    return {
      primaryUserId,
      secondaryUserId,
      transferredRecords: mergedData.transferredRecords,
    };
  }

  // ──────────────────────────────────────────────
  // FEATURE 2: RESET USER PASSWORD
  // ──────────────────────────────────────────────
  generateTemporaryPassword(): string {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%&*";
    const all = uppercase + lowercase + numbers + special;

    let password = "";
    password += uppercase[crypto.randomInt(uppercase.length)];
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += special[crypto.randomInt(special.length)];

    for (let i = 0; i < 8; i++) {
      password += all[crypto.randomInt(all.length)];
    }

    return password
      .split("")
      .sort(() => crypto.randomInt(-1, 2))
      .join("");
  }

  async resetUserPassword(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const tempPassword = this.generateTemporaryPassword();
    const passwordHash = await argon2.hash(tempPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        requiresPasswordChange: true,
      },
    });

    await auditService.logAction({
      userId: adminId,
      action: "PASSWORD_RESET",
      module: "USER_MANAGEMENT",
      resourceId: userId,
      details: `Password reset for user ${user.phone} by admin`,
    });

    return { tempPassword, userId: user.id, phone: user.phone };
  }

  // ──────────────────────────────────────────────
  // FEATURE 3: FEATURE FLAGS
  // ──────────────────────────────────────────────
  async getFeatureFlags() {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: "asc" },
    });
    if (flags.length === 0) {
      const defaults = [
        {
          key: "FARMER_MODULE",
          enabled: true,
          description: "Farmer mobile app module",
        },
        {
          key: "EXTENSION_MODULE",
          enabled: true,
          description: "Extension officer module",
        },
        {
          key: "COOPERATIVE_MODULE",
          enabled: true,
          description: "Cooperative management module",
        },
        {
          key: "ADMIN_MODULE",
          enabled: true,
          description: "Administration panel",
        },
        {
          key: "AI_RECOMMENDATIONS",
          enabled: true,
          description: "AI-powered farming recommendations",
        },
        {
          key: "COMMUNITY_MODULE",
          enabled: true,
          description: "Community forum and posts",
        },
        {
          key: "REPORTS_MODULE",
          enabled: true,
          description: "Reports and analytics",
        },
        {
          key: "NOTIFICATIONS_MODULE",
          enabled: true,
          description: "Push/SMS notifications",
        },
        {
          key: "LIVESTOCK_GUIDANCE",
          enabled: true,
          description: "Livestock management guidance",
        },
        {
          key: "CROP_GUIDANCE",
          enabled: true,
          description: "Crop management guidance",
        },
      ];
      for (const flag of defaults) {
        await prisma.featureFlag.upsert({
          where: { key: flag.key },
          create: flag,
          update: {},
        });
      }
      return defaults;
    }
    return flags;
  }

  async updateFeatureFlags(
    flags: Array<{ key: string; enabled: boolean }>,
    adminId: string,
  ) {
    const results = [];
    for (const flag of flags) {
      const result = await prisma.featureFlag.upsert({
        where: { key: flag.key },
        create: { key: flag.key, enabled: flag.enabled, updatedBy: adminId },
        update: { enabled: flag.enabled, updatedBy: adminId },
      });
      results.push(result);
    }

    await auditService.logAction({
      userId: adminId,
      action: "UPDATE_FEATURE_FLAGS",
      module: "SYSTEM_CONFIG",
      resourceId: "feature-flags",
      details: `Updated ${flags.length} feature flags`,
    });

    return results;
  }

  // ──────────────────────────────────────────────
  // FEATURE 4: PASSWORD POLICY
  // ──────────────────────────────────────────────
  async getPasswordPolicy() {
    const policy = await prisma.securityPolicy.findUnique({
      where: { policyType: "PASSWORD_POLICY" },
    });

    if (!policy) {
      const defaults = {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecial: true,
        expiryDays: 0,
        preventReuse: 0,
      };
      return defaults;
    }

    return policy.config as any;
  }

  async updatePasswordPolicy(
    config: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecial: boolean;
      expiryDays: number;
      preventReuse: number;
    },
    adminId: string,
  ) {
    const validated = {
      minLength: Math.max(8, Math.min(32, config.minLength)),
      requireUppercase: !!config.requireUppercase,
      requireLowercase: !!config.requireLowercase,
      requireNumbers: !!config.requireNumbers,
      requireSpecial: !!config.requireSpecial,
      expiryDays: Math.max(0, Math.min(365, config.expiryDays)),
      preventReuse: Math.max(0, Math.min(10, config.preventReuse)),
    };

    const result = await prisma.securityPolicy.upsert({
      where: { policyType: "PASSWORD_POLICY" },
      create: {
        policyType: "PASSWORD_POLICY",
        config: validated as any,
        updatedBy: adminId,
      },
      update: { config: validated as any, updatedBy: adminId },
    });

    await auditService.logAction({
      userId: adminId,
      action: "UPDATE_PASSWORD_POLICY",
      module: "SECURITY",
      resourceId: "password-policy",
      details: `Password policy updated`,
    });

    return result.config as any;
  }

  // ──────────────────────────────────────────────
  // FEATURE 5: AUDIT RETENTION + CLEANUP
  // ──────────────────────────────────────────────
  async getAuditRetention() {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "AUDIT_RETENTION_DAYS" },
    });
    const retentionDays = setting?.value ? parseInt(setting.value, 10) : 90;
    const archiveSetting = await prisma.systemSetting.findUnique({
      where: { key: "AUDIT_ARCHIVE_BEFORE_CLEANUP" },
    });
    const archiveBeforeCleanup = archiveSetting?.value === "true";

    const count = await prisma.auditLog.count();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const expiringCount = await prisma.auditLog.count({
      where: { createdAt: { lt: cutoff } },
    });

    return {
      retentionDays,
      archiveBeforeCleanup,
      totalLogs: count,
      expiringLogs: expiringCount,
    };
  }

  async updateAuditRetention(
    config: { retentionDays: number; archiveBeforeCleanup: boolean },
    adminId: string,
  ) {
    const days = Math.max(1, Math.min(3650, config.retentionDays));
    await prisma.systemSetting.upsert({
      where: { key: "AUDIT_RETENTION_DAYS" },
      create: { key: "AUDIT_RETENTION_DAYS", value: String(days) },
      update: { value: String(days) },
    });
    await prisma.systemSetting.upsert({
      where: { key: "AUDIT_ARCHIVE_BEFORE_CLEANUP" },
      create: {
        key: "AUDIT_ARCHIVE_BEFORE_CLEANUP",
        value: String(config.archiveBeforeCleanup),
      },
      update: { value: String(config.archiveBeforeCleanup) },
    });

    await auditService.logAction({
      userId: adminId,
      action: "UPDATE_AUDIT_RETENTION",
      module: "SYSTEM_CONFIG",
      resourceId: "audit-retention",
      details: `Retention set to ${days} days, archiveBeforeCleanup: ${config.archiveBeforeCleanup}`,
    });

    return this.getAuditRetention();
  }

  async cleanupAuditLogs(adminId: string) {
    const retention = await this.getAuditRetention();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retention.retentionDays);

    if (retention.archiveBeforeCleanup) {
      const logsToDelete = await prisma.auditLog.findMany({
        where: { createdAt: { lt: cutoff } },
        orderBy: { createdAt: "asc" },
      });
      if (logsToDelete.length > 0) {
        const fs = await import("fs/promises");
        const csvPath = `audit-archive-${Date.now()}.csv`;
        const headers =
          "id,userId,action,resourceType,resourceId,createdAt,ipAddress\n";
        const rows = logsToDelete
          .map(
            (l) =>
              `${l.id},${l.userId},"${l.action}","${l.resourceType || ""}","${l.resourceId || ""}",${l.createdAt.toISOString()},"${l.ipAddress || ""}"`,
          )
          .join("\n");
        await fs.writeFile(csvPath, headers + rows, "utf-8");
      }
    }

    const deleted = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    await auditService.logAction({
      userId: adminId ?? "system",
      action: "AUDIT_CLEANUP",
      module: "SYSTEM_CONFIG",
      resourceId: "audit-cleanup",
      details: `Deleted ${deleted.count} audit logs older than ${retention.retentionDays} days`,
    });

    return {
      deletedCount: deleted.count,
      retentionDays: retention.retentionDays,
      cutoff: cutoff.toISOString(),
    };
  }

  // ──────────────────────────────────────────────
  // FEATURE 6: FORCE LOGOUT USER
  // ──────────────────────────────────────────────
  async forceLogoutUser(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    if (adminId === userId) throw new Error("Cannot force logout yourself");

    const sessionResult = await prisma.session.deleteMany({
      where: { userId },
    });
    const tokenResult = await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    await auditService.logAction({
      userId: adminId,
      action: "SESSION_REVOKE",
      module: "SECURITY",
      resourceId: userId,
      details: `Force logged out user ${user.phone}: ${sessionResult.count} sessions, ${tokenResult.count} refresh tokens revoked`,
    });

    return {
      sessionsRevoked: sessionResult.count,
      tokensRevoked: tokenResult.count,
    };
  }
}

export const superAdminService = new SuperAdminService();
