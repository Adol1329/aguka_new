import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";
import {
  createFeedback,
  getFeedbackList,
  getFeedbackById,
  updateFeedbackStatus,
  getFeedbackAnalytics,
  getUserFeedbackHistory,
  submitQuickFeedback,
} from "../controllers/feedback.controller.js";

const router = Router();

// All feedback routes require authentication
router.use(authenticate);

// Create feedback (available to all authenticated users)
router.post("/", createFeedback);

// Submit quick feedback (simplified feedback form)
router.post("/quick", submitQuickFeedback);

// Get user's own feedback history
router.get("/my-feedback", getUserFeedbackHistory);

// Get feedback analytics (admin only)
router.get(
  "/analytics",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getFeedbackAnalytics,
);

// Get feedback list (admin only)
router.get(
  "/",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getFeedbackList,
);

// Get specific feedback (admin only or own feedback)
router.get("/:id", getFeedbackById);

// Update feedback status (admin only)
router.patch(
  "/:id/status",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  updateFeedbackStatus,
);

export default router;
