import argon2 from "argon2";
import crypto from "crypto";
import { UserRole } from "../types/index.js";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "../middleware/error.middleware.js";
import { PaginationParams, FilterParams } from "../types/index.js";
import { auditService } from "./audit.service.js";
import { prisma } from "../prisma.js";
import { mailService } from "../mail/mail.service.js";

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      include: {
        farmerProfile: true,
        cooperativeMember: true,
        extensionAssignments: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return this.formatUser(user);
  }

  async updateProfile(userId: string, data: Record<string, unknown>) {
    // 📸 CAPTURE BEFORE STATE
    const before = await this.getProfile(userId);

    if (!before) {
      throw new NotFoundError("User");
    }

    const userData: Record<string, unknown> = {};

    if (data.email !== undefined) {
      const email = (data.email as string).trim();
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new ConflictError("Email");
      }

      userData.email = email || null;
    }

    if (data.fullName !== undefined) {
      userData.fullName = data.fullName as string;
    }

    if (data.language !== undefined) {
      userData.language = data.language as any;
    }

    if (data.isOnboarded !== undefined) {
      userData.isOnboarded = !!data.isOnboarded;
    }

    if (data.avatarUrl !== undefined) {
      userData.avatarUrl = data.avatarUrl as string;
    }

    const baseLocationFields = ["province", "district", "sector", "cell", "village"];
    for (const field of baseLocationFields) {
      if (data[field] !== undefined) {
        userData[field] = data[field] as string;
      }
    }

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userData,
      });
    }

    const farmerData: Record<string, unknown> = {};
    const farmerFields = [
      "fullName",
      "farmName",
      "location",
      "district",
      "sector",
      "cell",
      "village",
      "provinceCode",
      "districtCode",
      "sectorCode",
      "cellCode",
      "villageCode",
      "farmSizeHectares",
      "gpsLatitude",
      "gpsLongitude",
      "waterSource",
      "irrigationType",
      "preferredChannel",
      "emergencyContact",
      "familyMembers",
    ];

    for (const field of farmerFields) {
      if (data[field] !== undefined) {
        farmerData[field] = data[field];
      }
    }

    if (Object.keys(farmerData).length > 0) {
      const existingProfile = await prisma.farmerProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        await prisma.farmerProfile.update({
          where: { userId },
          data: farmerData,
        });
      }
    }

    const after = await this.getProfile(userId);

    // 📜 LOG AUDIT
    await auditService.logWithSnapshot({
      userId,
      action: "UPDATE_PROFILE",
      module: "USER_PROFILE",
      resourceId: userId,
      before,
      after,
    });

    return after;
  }

  async getUserById(id: string) {
    const user = await prisma.user.findFirst({
      where: { id },
      include: {
        farmerProfile: true,
        cooperativeMember: true,
        extensionAssignments: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return this.formatUser(user);
  }

  async listUsers(
    params: PaginationParams &
      FilterParams & { role?: UserRole; excludeRole?: UserRole },
  ) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortBy = params.sortBy ?? "createdAt";
    const sortOrder = params.sortOrder ?? "desc";

    const where: Record<string, unknown> = {};

    if (params.role) {
      where.role = params.role;
    }

    if (params.excludeRole) {
      where.role = { not: params.excludeRole };
    }

    if (params.search) {
      where.OR = [
        { phone: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          farmerProfile: true,
          cooperativeMember: true,
          extensionAssignments: true,
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => this.formatUser(u)),
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

  async updateUserRole(userId: string, role: UserRole, updatedBy: string) {
    const currentUser = await prisma.user.findFirst({
      where: { id: updatedBy },
    });

    if (currentUser?.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError("Only Super Admin can update user roles");
    }

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });

    const after = this.formatUser(updated);

    // 📜 LOG AUDIT
    await auditService.logWithSnapshot({
      userId: updatedBy,
      action: "UPDATE_USER_ROLE",
      module: "USER_MANAGEMENT",
      resourceId: userId,
      before: this.formatUser(user),
      after,
    });

    return after;
  }

  async updateUserStatus(
    userId: string,
    status: string,
    isActive: boolean,
    updatedBy: string,
  ) {
    const currentUser = await prisma.user.findFirst({
      where: { id: updatedBy },
    });

    if (
      currentUser?.role !== UserRole.SUPER_ADMIN &&
      currentUser?.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenError("Only Admin can update user status");
    }

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    // Use prisma.userStatus enum directly or cast string. Wait, prisma might complain if string doesn't match enum. Let's cast it safely.
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive, status: status as any },
    });

    const after = this.formatUser(updated);

    await auditService.logWithSnapshot({
      userId: updatedBy,
      action: "UPDATE_USER_STATUS",
      module: "USER_MANAGEMENT",
      resourceId: userId,
      before: this.formatUser(user),
      after,
    });

    return after;
  }

  async bulkUpdateStatus(
    userIds: string[],
    status: string,
    isActive: boolean,
    updatedBy: string,
  ) {
    const currentUser = await prisma.user.findFirst({
      where: { id: updatedBy },
    });

    if (
      currentUser?.role !== UserRole.SUPER_ADMIN &&
      currentUser?.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenError("Only Admin can update user status");
    }

    await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { isActive, status: status as any },
    });

    await auditService.logAction({
      userId: updatedBy,
      action: "BULK_UPDATE_STATUS",
      module: "USER_MANAGEMENT",
      resourceId: "multiple",
      details: `Updated ${userIds.length} users to status ${status}`,
    });

    return { message: "Users updated successfully" };
  }

  async adminResetPassword(
    adminId: string,
    targetUserId: string,
  ) {
    const admin = await prisma.user.findFirst({ where: { id: adminId } });
    if (!admin) throw new NotFoundError("Admin user");

    const target = await prisma.user.findFirst({ where: { id: targetUserId } });
    if (!target) throw new NotFoundError("Target user");

    const adminRole = admin.role as UserRole;
    const targetRole = target.role as UserRole;

    // Nobody can reset super_admin password through the UI
    if (targetRole === UserRole.SUPER_ADMIN) {
      throw new ForbiddenError(
        "Super Admin password cannot be reset through the UI",
      );
    }

    // Admin can only reset officer, cooperative, farmer
    if (
      adminRole === UserRole.ADMIN &&
      targetRole === UserRole.ADMIN
    ) {
      throw new ForbiddenError(
        "Admin cannot reset another Admin's password",
      );
    }

    if (!target.email) {
      throw new ValidationError(
        "Target user has no email address. Add an email before sending a password reset.",
      );
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const passwordHash = await argon2.hash(crypto.randomBytes(48).toString("hex"));

    const before = this.formatUser(target);

    await mailService.sendAdminPasswordResetOtp({
      email: target.email,
      fullName: target.fullName || target.phone,
      otp,
      phone: target.phone,
    });

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { phone: target.phone } }),
      prisma.passwordResetToken.create({
        data: { phone: target.phone, otp, expiresAt },
      }),
      prisma.user.update({
        where: { id: targetUserId },
        data: { passwordHash, requiresPasswordChange: true },
      }),
      prisma.refreshToken.deleteMany({ where: { userId: targetUserId } }),
      prisma.session.deleteMany({ where: { userId: targetUserId } }),
    ]);

    const updatedTarget = await prisma.user.findFirst({
      where: { id: targetUserId },
    });
    const after = updatedTarget ? this.formatUser(updatedTarget) : null;

    // Audit log
    await auditService.logWithSnapshot({
      userId: adminId,
      action: "RESET_PASSWORD",
      module: "USER_MANAGEMENT",
      resourceId: targetUserId,
      before,
      after,
    });

    return {
      success: true,
      delivery: "email",
      maskedEmail: this.maskEmail(target.email),
    };
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split("@");
    if (!domain) return "***";
    if (localPart.length <= 2) return `${localPart[0]}***@${domain}`;
    return `${localPart[0]}${"*".repeat(Math.min(localPart.length - 2, 3))}@${domain}`;
  }

  private formatUser(user: any) {
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      language: user.language,
      status: user.status,
      isActive: user.isActive,
      province: user.province,
      district: user.district,
      sector: user.sector,
      cell: user.cell,
      village: user.village,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      profile: user.farmerProfile
        ? {
            id: user.farmerProfile.id,
            fullName: user.farmerProfile.fullName,
            farmName: user.farmerProfile.farmName,
            location: user.farmerProfile.location,
            district: user.farmerProfile.district,
            sector: user.farmerProfile.sector,
            cell: user.farmerProfile.cell,
            village: user.farmerProfile.village,
            farmSizeHectares: user.farmerProfile.farmSizeHectares,
            gpsLatitude: user.farmerProfile.gpsLatitude,
            gpsLongitude: user.farmerProfile.gpsLongitude,
            waterSource: user.farmerProfile.waterSource,
            irrigationType: user.farmerProfile.irrigationType,
            preferredChannel: user.farmerProfile.preferredChannel,
            emergencyContact: user.farmerProfile.emergencyContact,
            familyMembers: user.farmerProfile.familyMembers,
            cooperativeId: user.farmerProfile.cooperativeId,
          }
        : null,
      cooperativeId:
        user.farmerProfile?.cooperativeId ||
        user.cooperativeMember?.cooperativeId,
      officerId: user.extensionAssignments?.[0]?.extensionOfficerId,
    };
  }
}

export const userService = new UserService();
