import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";
import {
  listReports,
  farmerReportHandler,
  officerReportHandler,
  cooperativeReportHandler,
  adminReportHandler,
  superAdminReportHandler,
} from "./reports-v2.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listReports));

router.get(
  "/farmer/:type",
  authorize(UserRole.FARMER, UserRole.SUPER_ADMIN),
  asyncHandler(farmerReportHandler),
);

router.get(
  "/officer/:type",
  authorize(UserRole.OFFICER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(officerReportHandler),
);

router.get(
  "/cooperative/:type",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(cooperativeReportHandler),
);

router.get(
  "/admin/:type",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(adminReportHandler),
);

router.get(
  "/super_admin/:type",
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(superAdminReportHandler),
);

export default router;
