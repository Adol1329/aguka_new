import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  rateLimiter,
  authRateLimiter,
} from "../middleware/rateLimiter.middleware.js";
import {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  verifyOtpSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  forgotPasswordCheckSchema,
  verifyResetOtpSchema,
  resetPasswordWithOtpSchema,
  forceChangePasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import {
  register,
  login,
  requestOtp,
  verifyPhone,
  firebaseVerify,
  refreshToken,
  logout,
  changePassword,
  checkForgotPassword,
  verifyResetOtp,
  resetPasswordWithOtp,
  forceChangePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.post(
  "/register",
  rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 10 }),
  validate(registerSchema),
  asyncHandler(register),
);

router.post(
  "/login",
  rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 5 }),
  authRateLimiter,
  validate(loginSchema),
  asyncHandler(login),
);

router.post(
  "/request-otp",
  rateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 3 }),
  validate(requestOtpSchema),
  asyncHandler(requestOtp),
);

router.post(
  "/verify-phone",
  rateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 5 }),
  validate(verifyOtpSchema),
  asyncHandler(verifyPhone),
);

router.post(
  "/firebase-verify",
  rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 20 }),
  asyncHandler(firebaseVerify),
);

router.post("/refresh-token", asyncHandler(refreshToken));

router.post("/logout", authenticate, asyncHandler(logout));

router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(changePassword),
);

// ── Legacy forgot/reset (kept for backward compat) ──
router.post(
  "/forgot-password",
  rateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 3 }),
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword),
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(resetPassword),
);

// ── NEW Smart Password Reset Flow ──
router.post(
  "/forgot-password/check",
  rateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 3 }),
  validate(forgotPasswordCheckSchema),
  asyncHandler(checkForgotPassword),
);

router.post(
  "/forgot-password/verify-otp",
  rateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 10 }),
  validate(verifyResetOtpSchema),
  asyncHandler(verifyResetOtp),
);

router.post(
  "/forgot-password/reset",
  rateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 5 }),
  validate(resetPasswordWithOtpSchema),
  asyncHandler(resetPasswordWithOtp),
);

// Force change password (requires auth — triggered after admin reset)
router.patch(
  "/change-password/force",
  authenticate,
  validate(forceChangePasswordSchema),
  asyncHandler(forceChangePassword),
);

export default router;
