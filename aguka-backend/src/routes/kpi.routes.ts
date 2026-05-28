import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import {
  authenticate,
  authorize,
  authorizeFarmerOrRole,
} from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";

import {
  getSummary,
  getSoilKpi,
  getIrrigationKpi,
  getFarmHealthScore,
  getSensorsStatus,
} from "../controllers/kpi.controller.js";

const router = Router();

// Apply auth middleware to all KPI routes
router.use(authenticate);

// DASHBOARD KPIs - Global summary for higher roles
router.get(
  "/summary",
  authorize(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.OFFICER,
    UserRole.COOPERATIVE,
  ),
  asyncHandler(getSummary),
);

// SOIL & WEATHER - Specific farm data
router.get(
  "/soil/:id",
  authorizeFarmerOrRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OFFICER),
  asyncHandler(getSoilKpi),
);

// IRRIGATION - Specific farm data
router.get(
  "/irrigation/:id",
  authorizeFarmerOrRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OFFICER),
  asyncHandler(getIrrigationKpi),
);

// ANALYTICS - Specific farm health
router.get(
  "/farm-health/:id",
  authorizeFarmerOrRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OFFICER),
  asyncHandler(getFarmHealthScore),
);

// SYSTEM - Global sensor status
router.get(
  "/sensors/status",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OFFICER),
  asyncHandler(getSensorsStatus),
);

export default router;
