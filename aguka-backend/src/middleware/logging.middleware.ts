import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

export const loggingMiddleware = morgan(
  config.isProduction
    ? ":method :url :status :res[content-length] - :response-time ms"
    : "🚀 :method :url :status :res[content-length] - :response-time ms (:remote-addr)",
);

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor =
      status >= 500
        ? "\x1b[31m"
        : status >= 400
          ? "\x1b[33m"
          : status >= 300
            ? "\x1b[36m"
            : "\x1b[32m";
    const reset = "\x1b[0m";

    logger.info(
      `${statusColor}${req.method} ${req.path} ${status} ${duration}ms${reset}`,
    );
  });

  next();
};

export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const origin = req.headers.origin;

  if (origin && (config.isDevelopment || origin === config.frontendUrl)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept-Language",
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
};

export const securityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );

  if (config.isProduction) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  next();
};

export const contentTypeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    const contentType = req.headers["content-type"];

    if (!contentType || !contentType.includes("application/json")) {
      if (req.path.includes("/auth/")) {
        return next();
      }

      res.status(415).json({
        success: false,
        error: {
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: "Content-Type must be application/json",
        },
      });
      return;
    }
  }

  next();
};

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId =
    (req.headers["x-request-id"] as string) || generateRequestId();
  res.setHeader("X-Request-ID", requestId);
  req.headers["x-request-id"] = requestId;
  next();
};

const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export const timingMiddleware = (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next();
};
