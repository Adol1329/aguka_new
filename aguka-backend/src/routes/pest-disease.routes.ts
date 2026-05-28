import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";
import {
  getPestDiseaseAlerts,
  getOfficerPestDiseaseAlerts,
  createPestDiseaseAlert,
  updatePestDiseaseAlert,
  getPestDiseaseStats,
} from "../controllers/pest-disease.controller.js";

const router = Router();

router.get(
  "/alerts",
  authenticate,
  authorize(UserRole.OFFICER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getOfficerPestDiseaseAlerts),
);

// Get pest/disease alerts for cooperative or farmer
router.get(
  "/:id/alerts",
  authenticate,
  authorize(
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.COOPERATIVE,
    UserRole.FARMER,
  ),
  asyncHandler(getPestDiseaseAlerts),
);

// Create new pest/disease alert (officer/admin only)
router.post(
  "/alerts",
  authenticate,
  authorize(UserRole.OFFICER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(createPestDiseaseAlert),
);

// Update pest/disease alert status (mark as read, etc.)
router.patch(
  "/alerts/:alertId",
  authenticate,
  asyncHandler(updatePestDiseaseAlert),
);

// Get pest/disease statistics for cooperative dashboard
router.get(
  "/:id/stats",
  authenticate,
  authorize(
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.COOPERATIVE,
  ),
  asyncHandler(getPestDiseaseStats),
);

export default router;
