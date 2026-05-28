import { rateLimit } from "express-rate-limit";
import { config } from "../config/index.js";

/**
 * Global rate limiter for all API routes
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP, please try again after 15 minutes",
    },
  },
  skip: () => config.env === "development",
});

/**
 * Strict rate limiter for sensitive endpoints (Auth, OTP)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 authentication attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      message: "Too many login attempts, please try again after 15 minutes",
    },
  },
  skip: () => config.env === "development",
});

/**
 * USSD/SMS rate limiter (high priority, low frequency)
 */
export const ussdRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 USSD requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "USSD_RATE_LIMIT_EXCEEDED",
      message: "Please slow down. Too many USSD requests.",
    },
  },
  skip: () => config.env === "development",
});

/**
 * Export a general rateLimiter factory for custom limits
 */
export const rateLimiter = (options: { windowMs: number; maxRequests: number }) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests, please try again later.",
      },
    },
    skip: () => config.env === "development",
  });
};
