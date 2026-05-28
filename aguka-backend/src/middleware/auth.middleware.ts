import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";
import { JwtPayload, UserRole, Permission } from "../types/index.js";
import { UnauthorizedError, ForbiddenError } from "./error.middleware.js";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { getRolePermissions } from "../utils/permissionCache.js";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      userId?: string;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

const canUseTemporaryPasswordRoute = (url: string) =>
  url.includes("/auth/change-password/force") ||
  url.includes("/auth/logout") ||
  url.includes("/users/me");

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // #region agent log
  const authPath = req.path;
  if (authPath.includes("health") || authPath.includes("monitoring")) {
    fetch("http://127.0.0.1:7646/ingest/8e7223a1-1e67-4704-b579-50d84bc12fc1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "8574fc",
      },
      body: JSON.stringify({
        sessionId: "8574fc",
        runId: "pre-fix",
        hypothesisId: "H1",
        location: "auth.middleware.ts:authenticate",
        message: "authenticate called on health/monitoring path",
        data: { path: authPath, originalUrl: req.originalUrl },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      const revoked = await prisma.revokedToken.findUnique({
        where: { token },
      });

      if (revoked) {
        throw new UnauthorizedError("Token has been revoked");
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { requiresPasswordChange: true },
      });

      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      if (
        user.requiresPasswordChange &&
        !canUseTemporaryPasswordRoute(req.originalUrl)
      ) {
        throw new ForbiddenError("Password change required");
      }

      req.user = decoded;
      req.userId = decoded.sub;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("Token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError("Invalid token");
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = decoded;
      req.userId = decoded.sub;
    } catch {
      // Token invalid, but optional auth so continue
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        logger.warn(
          `Authorization failed: No user on request for ${req.method} ${req.path}`,
        );
        throw new UnauthorizedError("Authentication required");
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(
          `Authorization failed for user ${req.user.sub}: Role "${req.user.role}" not in allowed roles [${allowedRoles.join(", ")}] for ${req.method} ${req.path}`,
        );
        throw new ForbiddenError("Insufficient permissions");
      }

      const requiredPermission = inferPermission(req);
      if (requiredPermission) {
        const rolePermissions = await getRolePermissions(req.user.role);
        const hasPermission =
          rolePermissions.includes("*") ||
          rolePermissions.includes(requiredPermission);

        if (!hasPermission) {
          throw new ForbiddenError("Insufficient permissions");
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

const inferPermission = (req: Request): string | null => {
  const path = req.originalUrl.split("?")[0];
  const method = req.method.toUpperCase();

  if (path.includes("/superadmin/backups")) return "manage_backups";
  if (path.includes("/superadmin/roles")) return "manage_roles";
  if (path.includes("/superadmin/settings")) return "manage_settings";
  if (path.includes("/superadmin/audit-logs") || path.includes("/audit")) {
    return "view_audit_logs";
  }
  if (
    path.includes("/superadmin/users") ||
    (path.includes("/users") &&
      !(method === "GET" && req.user?.role === UserRole.COOPERATIVE))
  ) {
    return "manage_users";
  }
  if (path.includes("/admin/notifications")) return "broadcast_notifications";
  if (path.includes("/admin") || path.includes("/superadmin/reports")) {
    return "manage_all_data";
  }
  if (path.includes("/officer/advisories")) return "send_advisories";
  if (path.includes("/farmers/assigned") || path.includes("/officer/farms")) {
    return "manage_assigned_farmers";
  }
  if (path.includes("/cooperatives") && path.includes("/resources")) {
    return "manage_resources";
  }
  if (path.includes("/cooperatives") && path.includes("/activities")) {
    return "schedule_events";
  }
  if (path.includes("/cooperatives") && path.includes("/members")) {
    return "manage_cooperative_members";
  }
  if (path.includes("/reports") && method !== "GET") return "view_reports";

  return null;
};

export const authorizeFarmerOrRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    // Allow the user to access their own data if the requested farmer id matches their userId
    // We assume the farmer id is in req.params.id
    if (req.params.id && req.user.sub === req.params.id) {
      return next();
    }

    // Otherwise check roles
    if (!allowedRoles.some((role) => req.user!.role === role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    next();
  };
};

export const checkPermission = (...permissions: Permission[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const userRole = req.user!.role;
      const rolePermissions = await getRolePermissions(userRole);

      if (rolePermissions.includes("*")) {
        return next();
      }

      const hasPermission = permissions.every((permission) =>
        rolePermissions.includes(permission),
      );

      if (!hasPermission) {
        throw new ForbiddenError("Insufficient permissions");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkOwnership = (resourceUserIdField: string = "userId") => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      if (
        req.user.role === UserRole.SUPER_ADMIN ||
        req.user.role === UserRole.ADMIN
      ) {
        return next();
      }

      const resourceUserId =
        req.params[resourceUserIdField] || req.body[resourceUserIdField];

      if (resourceUserId && resourceUserId !== req.user.sub) {
        throw new ForbiddenError("You do not have access to this resource");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const logAudit = async (
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  oldValue?: unknown,
  newValue?: unknown,
  ipAddress?: string,
  userAgent?: string,
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        oldValue: (oldValue as Prisma.InputJsonValue) || Prisma.JsonNull,
        newValue: (newValue as Prisma.InputJsonValue) || Prisma.JsonNull,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    logger.error("Failed to create audit log:", error);
  }
};
