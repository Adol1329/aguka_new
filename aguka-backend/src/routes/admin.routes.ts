import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { UserRole } from "../types/index.js";
import { adminResetPasswordSchema } from "../validators/auth.validator.js";
import {
  getKpiSummary,
  getFarmerGrowth,
  getAlertsByType,
  getSoilHealthDistribution,
  getSensorStatus,
  getFarmSoilHistory,
  getFarmReports,
  getAlerts,
  resolveAlert,
  broadcastSms,
  getSupportTickets,
  getSupportStats,
  replyToTicket,
  updateTicketStatus,
  getPendingUsers,
  approveUser,
  rejectUser,
  resetUserPassword,
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes are protected and require ADMIN or SUPER_ADMIN role
router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

// DASHBOARD / ANALYTICS
router.get("/analytics/summary", asyncHandler(getKpiSummary));
router.get("/analytics/farmers", asyncHandler(getFarmerGrowth));
router.get("/analytics/alerts", asyncHandler(getAlertsByType));
router.get("/analytics/soil", asyncHandler(getSoilHealthDistribution));

// SENSORS
router.get("/sensors/status", asyncHandler(getSensorStatus));
router.get("/farms/:id/soil/history", asyncHandler(getFarmSoilHistory));

// REPORTS
router.get("/reports/farms", asyncHandler(getFarmReports));

// ALERTS
router.get("/alerts", asyncHandler(getAlerts));
router.put("/alerts/:id/resolve", asyncHandler(resolveAlert));
router.post("/notifications/broadcast", asyncHandler(broadcastSms));

// SUPPORT
router.get("/support", asyncHandler(getSupportTickets));
router.get("/support/stats", asyncHandler(getSupportStats));
router.put("/support/:id/reply", asyncHandler(replyToTicket));
router.put("/support/:id/status", asyncHandler(updateTicketStatus));

// USERS (APPROVAL/REJECTION/RESET)
router.get("/pending-users", asyncHandler(getPendingUsers));
router.post("/users/:id/approve", asyncHandler(approveUser));
router.post("/users/:id/reject", asyncHandler(rejectUser));
router.patch(
  "/users/:userId/reset-password",
  validate(adminResetPasswordSchema),
  asyncHandler(resetUserPassword),
);

export default router;
