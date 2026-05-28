import { Request, Response, NextFunction } from "express";
import type { z } from "zod";
import { validationResult } from "express-validator";
import { ValidationError } from "./error.middleware.js";

// Augment Request type to support file uploads (multer)
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      file?: any;
      files?: any;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export const validate = (schema: z.ZodType) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw new ValidationError("Validation failed", errors);
      }

      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodType) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw new ValidationError("Invalid query parameters", errors);
      }

      req.query = result.data as Record<string, string>;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodType) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw new ValidationError("Invalid path parameters", errors);
      }

      req.params = result.data as Record<string, string>;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const sanitizeInput = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const sanitize = (obj: Record<string, unknown>): Record<string, unknown> => {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        sanitized[key] = value.trim();
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitize(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  };

  if (req.body && typeof req.body === "object") {
    req.body = sanitize(req.body as Record<string, unknown>);
  }

  next();
};

export const validateFileUpload = (
  _fieldName: string,
  options?: {
    maxSize?: number;
    allowedMimeTypes?: string[];
  },
) => {
  const maxSize = options?.maxSize ?? 5 * 1024 * 1024;
  const allowedMimeTypes = options?.allowedMimeTypes ?? [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const file = req.file;

      if (!file) {
        throw new ValidationError("No file uploaded");
      }

      if (file.size > maxSize) {
        throw new ValidationError(
          `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
        );
      }

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new ValidationError(
          `Invalid file type. Allowed: ${allowedMimeTypes.join(", ")}`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err: any) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    throw new ValidationError("Validation failed", formattedErrors);
  }
  next();
};
