import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

interface ErrorReport {
  id: string;
  timestamp: Date;
  error: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
    query: Record<string, any>;
    params: Record<string, any>;
    ip?: string;
    userAgent?: string;
  };
  user?: {
    id: string;
    role: string;
    phone: string;
  };
  context: {
    environment: string;
    version: string;
    nodeId?: string;
  };
}

class ErrorTrackingService {
  private errors: ErrorReport[] = [];
  private maxErrors = 1000; // Keep last 1k errors

  addError(error: ErrorReport) {
    this.errors.push(error);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log the error
    logger.error("Application Error", {
      errorId: error.id,
      error: error.error,
      request: error.request,
      user: error.user,
    });
  }

  getErrors(filters?: {
    userId?: string;
    errorName?: string;
    since?: Date;
    limit?: number;
  }) {
    let filtered = this.errors;

    if (filters?.userId) {
      filtered = filtered.filter((e) => e.user?.id === filters.userId);
    }
    if (filters?.errorName) {
      filtered = filtered.filter((e) => e.error.name === filters.errorName);
    }
    if (filters?.since) {
      filtered = filtered.filter((e) => e.timestamp >= filters.since!);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  getErrorStats() {
    const recent = this.getErrors({
      since: new Date(Date.now() - 24 * 60 * 60 * 1000),
    }); // Last 24 hours

    if (recent.length === 0) {
      return {
        totalErrors: 0,
        errorsByType: {},
        errorsByUser: {},
        errorsByEndpoint: {},
        topErrors: [],
      };
    }

    const errorsByType: Record<string, number> = {};
    const errorsByUser: Record<string, number> = {};
    const errorsByEndpoint: Record<string, number> = {};

    recent.forEach((error) => {
      // Count by error type
      const errorType = error.error.name || "Unknown";
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;

      // Count by user
      if (error.user?.id) {
        errorsByUser[error.user.id] = (errorsByUser[error.user.id] || 0) + 1;
      }

      // Count by endpoint
      const endpoint = error.request.url;
      errorsByEndpoint[endpoint] = (errorsByEndpoint[endpoint] || 0) + 1;
    });

    // Get top errors
    const topErrors = recent.slice(0, 10).map((error) => ({
      id: error.id,
      timestamp: error.timestamp,
      errorName: error.error.name,
      message: error.error.message,
      endpoint: error.request.url,
      userId: error.user?.id,
    }));

    return {
      totalErrors: recent.length,
      errorsByType,
      errorsByUser,
      errorsByEndpoint,
      topErrors,
    };
  }

  generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

const errorTrackingService = new ErrorTrackingService();

export const errorTracking = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errorReport: ErrorReport = {
    id: errorTrackingService.generateErrorId(),
    timestamp: new Date(),
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: (err as any).code,
    },
    request: {
      method: req.method,
      url: req.originalUrl || req.url,
      headers: req.headers as Record<string, string>,
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    },
    user: (req as any).user
      ? {
          id: (req as any).user.sub,
          role: (req as any).user.role,
          phone: (req as any).user.phone,
        }
      : undefined,
    context: {
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      nodeId: process.env.NODE_ID || "node-1",
    },
  };

  errorTrackingService.addError(errorReport);

  // Add error ID to response headers for debugging
  res.setHeader("X-Error-ID", errorReport.id);

  next(err);
};

export const getErrorData = (req: Request, res: Response) => {
  const { userId, errorName, since, limit } = req.query;

  const filters: any = {};
  if (userId) filters.userId = userId as string;
  if (errorName) filters.errorName = errorName as string;
  if (since) filters.since = new Date(since as string);
  if (limit) filters.limit = parseInt(limit as string);

  const errors = errorTrackingService.getErrors(filters);
  const stats = errorTrackingService.getErrorStats();

  res.json({
    success: true,
    data: errors,
    summary: stats,
  });
};

export const getErrorById = (req: Request, res: Response) => {
  const { errorId } = req.params;

  const error = errorTrackingService.getErrors().find((e) => e.id === errorId);

  if (!error) {
    res.status(404).json({
      success: false,
      error: "Error not found",
    });
    return;
  }

  res.json({
    success: true,
    data: error,
  });
};

export { errorTrackingService };
