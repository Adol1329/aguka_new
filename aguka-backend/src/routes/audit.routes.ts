import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";
import { getLogs, getRecentActivity } from "../controllers/audit.controller.js";

const router = Router();

// Audit logs retrieval (Super Admins & Admins query globally, other roles query their own logs)
router.get(
  "/",
  authenticate,
  asyncHandler(getLogs),
);

// Recent activity preview for the header (Admins & Super Admins)
router.get(
  "/recent",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getRecentActivity),
);

export default router;
