import { Router } from "express";
import { config } from "../config/index.js";
import { errorHandler, notFoundHandler } from "./error.middleware.js";
import {
  requestLogger,
  corsMiddleware,
  securityHeaders,
  requestIdMiddleware,
  timingMiddleware,
  loggingMiddleware,
} from "./logging.middleware.js";
import { authenticate, authorize, optionalAuth } from "./auth.middleware.js";
import {
  rateLimiter,
  globalRateLimiter,
  authRateLimiter,
  ussdRateLimiter,
} from "./rateLimiter.middleware.js";
import {
  validate,
  validateQuery,
  validateParams,
  validateRequest,
} from "./validate.middleware.js";

export {
  Router,
  config,
  errorHandler,
  notFoundHandler,
  requestLogger,
  loggingMiddleware,
  corsMiddleware,
  securityHeaders,
  requestIdMiddleware,
  timingMiddleware,
  authenticate,
  authorize,
  optionalAuth,
  rateLimiter,
  globalRateLimiter,
  authRateLimiter,
  ussdRateLimiter,
  validate,
  validateQuery,
  validateParams,
  validateRequest,
};
