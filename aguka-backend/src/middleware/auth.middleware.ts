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

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authorizeFarmerOrRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    // Allow the user to access their own data if the requested farmer id matches their userId
    // Check both :id and :farmerId param names
    const ownerId = req.params.farmerId || req.params.id;
    if (ownerId && req.user.sub === ownerId) {
      return next();
    }

    // Otherwise check roles
    if (allowedRoles.length > 0 && !allowedRoles.some((role) => req.user!.role === role)) {
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

/**
 * Verifies that a COOPERATIVE-role user manages the cooperative in req.params.id.
 * ADMIN, SUPER_ADMIN, OFFICER, and FARMER bypass this check — their access is
 * already scoped by the authorize() middleware and per-handler queries.
 */
export const requireCooperativeOwnership = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { role, sub: userId } = req.user;

    if (
      role === UserRole.ADMIN ||
      role === UserRole.SUPER_ADMIN ||
      role === UserRole.OFFICER ||
      role === UserRole.FARMER
    ) {
      return next();
    }

    if (role === UserRole.COOPERATIVE) {
      const cooperativeId = req.params.id;
      if (!cooperativeId) return next();

      const membership = await prisma.cooperativeMember.findFirst({
        where: { userId, cooperativeId, role: "manager" },
      });

      if (!membership) {
        throw new ForbiddenError("You do not manage this cooperative");
      }
    }

    next();
  } catch (error) {
    next(error);
  }
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
