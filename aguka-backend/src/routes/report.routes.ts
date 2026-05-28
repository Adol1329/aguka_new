import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";
import {
  generateSoilReport,
  generateIrrigationReport,
  generateCropReport,
  generatePerformanceReport,
  generateAllReports,
  generateFinancialReport,
  listFinancialReports,
  exportFinancialReport,
  signCertificate,
  getAnalytics,
} from "../controllers/report.controller.js";

const router = Router();

router.get("/analytics", authenticate, asyncHandler(getAnalytics));

router.get("/soil", authenticate, asyncHandler(generateSoilReport));

router.get("/irrigation", authenticate, asyncHandler(generateIrrigationReport));

router.get("/crops", authenticate, asyncHandler(generateCropReport));

router.get(
  "/performance",
  authenticate,
  asyncHandler(generatePerformanceReport),
);

router.get("/all", authenticate, asyncHandler(generateAllReports));

router.post(
  "/financial",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(generateFinancialReport),
);

router.get(
  "/financial",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(listFinancialReports),
);

router.get(
  "/:id/export",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(exportFinancialReport),
);

router.get(
  "/sign/:farmerId",
  authenticate,
  authorize(UserRole.OFFICER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(signCertificate),
);

export default router;
