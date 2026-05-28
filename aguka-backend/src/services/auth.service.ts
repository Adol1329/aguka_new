import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User, UserRole } from "@prisma/client";
import { config } from "../config/index.js";
import { JwtPayload, UserStatus } from "../types/index.js";
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../middleware/error.middleware.js";
import { RegisterInput, LoginInput } from "../validators/auth.validator.js";

import { prisma } from "../prisma.js";

import { firebaseAdmin } from "../utils/firebase.js";
import { smsService } from "./sms.service.js";
import { logger } from "../utils/logger.js";
import { mailService } from "../mail/mail.service.js";

export class AuthService {
  async verifyFirebaseToken(idToken: string) {
    try {
      // 1. Verify the token with Firebase
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      const phone = decodedToken.phone_number;

      if (!phone) {
        throw new ValidationError("Token does not contain a phone number");
      }

      // 2. Find user by phone (handle normalized phone number)
      // Note: Firebase phone is usually E.164 (+250...)
      const user = await prisma.user.findFirst({
        where: { phone },
        include: {
          farmerProfile: true,
          cooperativeMember: true,
          extensionAssignments: true,
        },
      });

      if (!user) {
        // If user doesn't exist, we return the phone so the frontend can proceed to registration
        return {
          registered: false,
          phone,
          firebaseUid: decodedToken.uid,
        };
      }

      // 3. Log user in
      if (user.status === UserStatus.SUSPENDED) {
        throw new UnauthorizedError("Account suspended");
      }

      // Mark as active/verified if not already
      if (
        user.status === UserStatus.PENDING_VERIFICATION ||
        user.status === UserStatus.INACTIVE
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: { status: UserStatus.ACTIVE },
        });
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      await prisma.refreshToken.deleteMany({
        where: { userId: user.id },
      });

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        registered: true,
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error("Firebase verification error:", error);
      throw new UnauthorizedError("Invalid Firebase token");
    }
  }

  async register(data: RegisterInput) {
    const phone = this.normalizePhone(data.phone);
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, ...(data.email ? [{ email: data.email }] : [])],
      },
    });

    if (existingUser) {
      throw new ConflictError("User with this phone or email already exists");
    }

    const passwordHash = data.password
      ? await argon2.hash(data.password)
      : null;

    const requestedRole = data.role as UserRole;
    
    // STRICT SECURITY FIX: Prevent privilege escalation
    if (requestedRole === UserRole.super_admin || requestedRole === UserRole.admin) {
      throw new ValidationError("Cannot self-register as an administrator.");
    }

    // Determine initial status based on role and password
    let initialStatus = data.password ? UserStatus.ACTIVE : UserStatus.PENDING_VERIFICATION;
    if (requestedRole === UserRole.officer || requestedRole === UserRole.cooperative) {
      initialStatus = UserStatus.PENDING_VERIFICATION;
    }

    const user = await prisma.user.create({
      data: {
        phone,
        email: data.email,
        fullName: data.fullName,
        passwordHash,
        role: requestedRole,
        language: data.language,
        status: initialStatus,
      },
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Fetch full user with relations for sanitization
    const fullUser = await prisma.user.findFirst({
      where: { id: user.id },
      include: {
        farmerProfile: true,
        cooperativeMember: true,
        extensionAssignments: true,
      },
    });

    if (["officer", "cooperative", "cooperative_manager"].includes(user.role)) {
      await mailService.sendRegistrationReceived({
        email: user.email,
        fullName: user.fullName || user.phone,
        role: user.role,
        phone: user.phone,
      });
    }

    return {
      user: this.sanitizeUser(fullUser || user),
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput) {
    const phone = this.normalizePhone(data.phone);
    const user = await prisma.user.findFirst({
      where: { phone },
      include: {
        farmerProfile: true,
        cooperativeMember: true,
        extensionAssignments: true,
      },
    });

    if (!user) {
      logger.debug(`Login failed: User not found for phone ${data.phone}`);
      throw new UnauthorizedError("Invalid credentials");
    }

    logger.debug(
      `User found: ${user.phone}, hashing password for verification...`,
    );

    if (user.passwordHash) {
      const isValidPassword = await argon2.verify(
        user.passwordHash,
        data.password,
      );
      logger.debug(`Password verification result: ${isValidPassword}`);
      if (!isValidPassword) {
        throw new UnauthorizedError("Invalid credentials");
      }
    } else {
      logger.debug(`Login failed: No password hash for user ${user.phone}`);
      throw new UnauthorizedError("Password not set. Please use OTP login.");
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedError("Account suspended");
    }

    if (user.status === UserStatus.INACTIVE) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: UserStatus.ACTIVE },
      });
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Fetch full user with relations for sanitization
    const fullUser = await prisma.user.findFirst({
      where: { id: user.id },
      include: {
        farmerProfile: true,
        cooperativeMember: true,
        extensionAssignments: true,
      },
    });

    return {
      user: this.sanitizeUser(fullUser || user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret,
      ) as JwtPayload;

      const storedToken = await prisma.refreshToken.findFirst({
        where: { token: refreshToken },
      });

      if (!storedToken) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      if (storedToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw new UnauthorizedError("Refresh token expired");
      }

      const user = await prisma.user.findFirst({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedError("Account not active");
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: {
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("Refresh token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError("Invalid refresh token");
      }
      throw error;
    }
  }

  async logout(userId: string, accessToken?: string, accessTokenExpiresAt?: number) {
    if (accessToken && accessTokenExpiresAt) {
      await prisma.revokedToken.upsert({
        where: { token: accessToken },
        update: {},
        create: {
          token: accessToken,
          userId,
          expiresAt: new Date(accessTokenExpiresAt * 1000),
        },
      });
    }

    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    await prisma.session.deleteMany({
      where: { userId },
    });

    return { message: "Logged out successfully" };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    if (user.passwordHash) {
      const isValid = await argon2.verify(user.passwordHash, currentPassword);
      if (!isValid) {
        throw new ValidationError("Current password is incorrect");
      }
    }

    const passwordHash = await argon2.hash(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: "Password changed successfully" };
  }

  async verifyPhone(phone: string, otp: string) {
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        phone,
        code: otp,
        expiresAt: { gte: new Date() },
      },
    });

    if (!otpRecord) {
      throw new ValidationError("Invalid or expired OTP");
    }

    await prisma.oTP.delete({
      where: { id: otpRecord.id },
    });

    const user = await prisma.user.findFirst({
      where: { phone },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: UserStatus.ACTIVE },
      });
    }

    return { message: "Phone verified successfully" };
  }

  async requestOtp(phone: string) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.oTP.create({
      data: {
        phone,
        code: otp,
        expiresAt,
      },
    });

    // Send OTP via Africa's Talking SMS
    if (smsService.isConfigured()) {
      const message = `Your Aguka verification code is: ${otp}. Valid for 10 minutes.`;
      const result = await smsService.sendSms(phone, message);
      if (!result.success) {
        logger.error(`Failed to send OTP SMS to ${phone}:`, result.error);
      }
    } else if (config.env === "development") {
      logger.debug(`OTP for ${phone}: ${otp}`);
    }

    return { message: "OTP sent successfully" };
  }

  async forgotPassword(phone: string) {
    const user = await prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      return { message: "If the phone number exists, an OTP will be sent" };
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oTP.create({
      data: {
        phone,
        code: otp,
        expiresAt,
      },
    });

    // Send OTP via Africa's Talking SMS
    if (smsService.isConfigured()) {
      const message = `Your Aguka password reset code is: ${otp}. Valid for 10 minutes.`;
      const result = await smsService.sendSms(phone, message);
      if (!result.success) {
        logger.error(
          `Failed to send password reset SMS to ${phone}:`,
          result.error,
        );
      }
    } else if (config.env === "development") {
      logger.debug(`Password reset OTP for ${phone}: ${otp}`);
    }

    return { message: "OTP sent for password reset" };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;

      const user = await prisma.user.findFirst({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new NotFoundError("User");
      }

      const passwordHash = await argon2.hash(newPassword);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      await prisma.refreshToken.deleteMany({
        where: { userId: user.id },
      });

      return { message: "Password reset successfully" };
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }

  async checkForgotPassword(phone: string) {
    const normalizedPhone = this.normalizePhone(phone);

    const user = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
      select: { id: true, email: true, phone: true },
    });

    if (!user) {
      return { exists: false };
    }

    // Rate limit: max 3 reset requests per phone per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = await prisma.passwordResetToken.count({
      where: { phone: normalizedPhone, createdAt: { gte: oneHourAgo } },
    });
    if (recentAttempts >= 3) {
      throw new ValidationError(
        "Too many reset attempts. Please wait 1 hour before trying again.",
      );
    }

    if (user.email) {
      const otp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Replace any existing token for this phone
      await prisma.passwordResetToken.deleteMany({
        where: { phone: normalizedPhone },
      });
      await prisma.passwordResetToken.create({
        data: { phone: normalizedPhone, otp, expiresAt },
      });

      await mailService.sendPasswordResetOtp({
        email: user.email,
        otp,
        phone: normalizedPhone,
      });

      if (config.env === "development") {
        logger.debug(`Password reset OTP for ${normalizedPhone}: ${otp}`);
      }

      return {
        exists: true,
        hasEmail: true,
        maskedEmail: this.maskEmail(user.email),
      };
    } else {
      return { exists: true, hasEmail: false };
    }
  }

  async verifyResetOtp(phone: string, otp: string) {
    const normalizedPhone = this.normalizePhone(phone);

    const token = await prisma.passwordResetToken.findFirst({
      where: { phone: normalizedPhone },
    });

    if (!token) {
      return {
        success: false,
        error: "Invalid or expired code. Please request a new one.",
      };
    }

    if (token.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: token.id } });
      return {
        success: false,
        error: "Code expired. Please request a new one.",
      };
    }

    if (token.attempts >= 3) {
      await prisma.passwordResetToken.delete({ where: { id: token.id } });
      return {
        success: false,
        error: "Too many attempts. Please request a new code.",
      };
    }

    if (token.otp !== otp) {
      const newAttempts = token.attempts + 1;
      if (newAttempts >= 3) {
        await prisma.passwordResetToken.delete({ where: { id: token.id } });
        return {
          success: false,
          error: "Too many attempts. Please request a new code.",
        };
      }
      await prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { attempts: newAttempts },
      });
      const remaining = 3 - newAttempts;
      return {
        success: false,
        error: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      };
    }

    return { success: true };
  }

  async resetPasswordWithOtp(
    phone: string,
    otp: string,
    newPassword: string,
  ) {
    const normalizedPhone = this.normalizePhone(phone);

    // Re-validate OTP as final security check
    const token = await prisma.passwordResetToken.findFirst({
      where: { phone: normalizedPhone },
    });

    if (!token || token.otp !== otp || token.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid or expired verification code");
    }

    const user = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });
    if (!user) throw new NotFoundError("User");

    // Ensure new password is not same as current
    if (user.passwordHash) {
      const isSame = await argon2.verify(user.passwordHash, newPassword);
      if (isSame) {
        throw new ValidationError(
          "New password cannot be the same as your current password",
        );
      }
    }

    const passwordHash = await argon2.hash(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, requiresPasswordChange: false },
    });

    // Single-use: delete OTP token
    await prisma.passwordResetToken.delete({ where: { id: token.id } });

    // Invalidate all sessions
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    return { success: true };
  }

  async forceChangePassword(userId: string, newPassword: string) {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) throw new NotFoundError("User");

    if (user.passwordHash) {
      const isSame = await argon2.verify(user.passwordHash, newPassword);
      if (isSame) {
        throw new ValidationError(
          "New password cannot be the same as your temporary password",
        );
      }
    }

    const passwordHash = await argon2.hash(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, requiresPasswordChange: false },
    });

    // Invalidate all refresh tokens so next login uses new password
    await prisma.refreshToken.deleteMany({ where: { userId } });

    return { success: true };
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split("@");
    if (!domain) return "***";
    if (localPart.length <= 2)
      return `${localPart[0]}***@${domain}`;
    return `${localPart[0]}${'*'.repeat(Math.min(localPart.length - 2, 3))}@${domain}`;
  }

  private generateAccessToken(user: any) {
    const cooperativeId =
      user.farmerProfile?.cooperativeId ||
      user.cooperativeMember?.cooperativeId;
    const officerId = user.extensionAssignments?.[0]?.extensionOfficerId;

    return jwt.sign(
      {
        sub: user.id,
        phone: user.phone,
        role: user.role,
        cooperativeId,
        officerId,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any },
    );
  }

  private generateRefreshToken(user: User) {
    return jwt.sign(
      {
        sub: user.id,
        type: "refresh",
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn as any },
    );
  }

  private sanitizeUser(user: any) {
    const {
      farmerProfile,
      cooperativeMember,
      extensionAssignments,
      ...sanitized
    } = user;

    // Remove sensitive data
    delete sanitized.passwordHash;

    return {
      ...sanitized,
      createdAt: sanitized.createdAt?.toISOString(),
      updatedAt: sanitized.updatedAt?.toISOString(),
      cooperativeId:
        farmerProfile?.cooperativeId || cooperativeMember?.cooperativeId,
      officerId: extensionAssignments?.[0]?.extensionOfficerId,
    };
  }

  private normalizePhone(phone: string): string {
    if (!phone) return "";
    // Strip + if present
    let normalized = phone.trim();
    if (normalized.startsWith("+")) {
      normalized = normalized.substring(1);
    }
    // Remove any spaces or non-digit characters
    return normalized.replace(/\D/g, "");
  }
}

export const authService = new AuthService();
