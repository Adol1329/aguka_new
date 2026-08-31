import { Router } from "express";
import { body } from "express-validator";
import {
  getMyCooperative,
  getCooperative,
  updateCooperative,
  getCooperativeStats,
  getCooperativeDashboard,
  getMembers,
  handleMemberAdd,
  updateMemberStatus,
  removeMember,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getResources,
  addResource,
  updateResource,
  deleteResource,
  distributeResource,
  getResourceDistributions,
  getMarketplace,
  createListing,
  updateListing,
  getAnnouncements,
  createAnnouncement,
  markAnnouncementRead,
  getMessages,
  sendMessage,
  getReports,
  generateReport,
  getCooperativePerformance,
  exportPerformanceReport,
  getAnalytics,
  getFarmerDetail,
  getJoinRequests,
  submitJoinRequest,
  getMyJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getEventAttendees,
  markAttendance,
  removeAttendee,
  updateDistributionStatus,
  getDues,
  createDue,
  updateDue,
  deleteDue,
  getExpenses,
  createExpense,
  deleteExpense,
  sendEventReminder,
  listCooperatives,
  createCooperative,
  assignManager,
  getFarmerImportTemplate,
  importFarmers,
} from "../controllers/cooperative.controller.js";
import { authenticate, authorize, requireCooperativeOwnership } from "../middleware/auth.middleware.js";
import { validate, validateRequest } from "../middleware/validate.middleware.js";
import { uploadSpreadsheet } from "../middleware/upload.middleware.js";
import {
  createActivitySchema,
  updateActivitySchema,
  createListingSchema,
  createDueSchema,
  updateDueSchema,
  createExpenseSchema,
  generateReportSchema,
  updateDistributionStatusSchema,
  createCooperativeSchema,
  assignManagerSchema,
} from "../validators/cooperative.validator.js";
import { UserRole } from "../types/index.js";

const router = Router();

router.use(authenticate);
router.use(requireCooperativeOwnership);

router.get("/me", getMyCooperative);

router.get(
  "/join-requests/mine",
  authorize(UserRole.FARMER),
  getMyJoinRequests,
);

router.get(
  "/",
  authorize(
    UserRole.FARMER,
    UserRole.COOPERATIVE,
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  listCooperatives,
);

router.post(
  "/",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(createCooperativeSchema),
  createCooperative,
);

router.put(
  "/:id/assign-manager",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(assignManagerSchema),
  assignManager,
);

router.get(
  "/:id",
  authorize(
    UserRole.COOPERATIVE,
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  getCooperative,
);

router.patch(
  "/:id",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  [
    body("name").optional().isString().notEmpty().withMessage("Name cannot be empty"),
    body("description").optional().isString(),
    body("district").optional().isString(),
    body("sector").optional().isString(),
    body("contactPhone").optional().isString(),
  ],
  validateRequest,
  updateCooperative,
);

router.get(
  "/:id/dashboard",
  authorize(
    UserRole.COOPERATIVE,
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  getCooperativeDashboard,
);

router.get(
  "/:id/stats",
  authorize(
    UserRole.COOPERATIVE,
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  getCooperativeStats,
);

router.get(
  "/:id/members",
  authorize(
    UserRole.FARMER,
    UserRole.COOPERATIVE,
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  getMembers,
);

router.post(
  "/:id/members",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  [
    body("userId").isUUID().withMessage("Valid user ID required"),
    body("role").optional().isString(),
  ],
  validateRequest,
  handleMemberAdd,
);

router.patch(
  "/:id/members/:memberId/status",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  [
    body("status")
      .isIn(["active", "inactive", "suspended"])
      .withMessage("Invalid status"),
  ],
  validateRequest,
  updateMemberStatus,
);

router.delete(
  "/:id/members/:memberId",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  removeMember,
);

router.get(
  "/:id/activities",
  authorize(
    UserRole.FARMER,
    UserRole.COOPERATIVE,
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  getActivities,
);

router.post(
  "/:id/activities",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(createActivitySchema),
  createActivity,
);

router.patch(
  "/:id/activities/:activityId",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(updateActivitySchema),
  updateActivity,
);

router.delete(
  "/:id/activities/:activityId",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  deleteActivity,
);

router.get(
  "/:id/resources",
  authorize(
    UserRole.FARMER,
    UserRole.COOPERATIVE,
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  getResources,
);

router.post(
  "/:id/resources",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  [
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("resourceType")
      .isIn(["equipment", "inputs", "storage", "transport"])
      .withMessage("Invalid resource type"),
  ],
  validateRequest,
  addResource,
);

router.patch(
  "/:id/resources/:resourceId",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  updateResource,
);

router.delete(
  "/:id/resources/:resourceId",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  deleteResource,
);

router.post(
  "/:id/resources/:resourceId/distribute",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  distributeResource,
);

router.get(
  "/:id/distributions",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getResourceDistributions,
);

router.get(
  "/:id/marketplace",
  authorize(
    UserRole.FARMER,
    UserRole.COOPERATIVE,
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  getMarketplace,
);

router.post(
  "/:id/marketplace",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(createListingSchema),
  createListing,
);

router.patch(
  "/:id/marketplace/:listingId",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  updateListing,
);

router.get(
  "/:id/announcements",
  authorize(
    UserRole.FARMER,
    UserRole.COOPERATIVE,
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  getAnnouncements,
);

router.post(
  "/:id/announcements",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  [
    body("title").isString().notEmpty().withMessage("Title is required"),
    body("content").isString().notEmpty().withMessage("Content is required"),
    body("priority")
      .optional()
      .isIn(["low", "normal", "high", "urgent"])
      .withMessage("Invalid priority"),
  ],
  validateRequest,
  createAnnouncement,
);

router.patch(
  "/:id/announcements/:announcementId/read",
  authorize(
    UserRole.FARMER,
    UserRole.COOPERATIVE,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  markAnnouncementRead,
);

router.get(
  "/:id/messages",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getMessages,
);

router.post(
  "/:id/messages",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  [
    body("content")
      .isString()
      .notEmpty()
      .withMessage("Message content is required"),
  ],
  validateRequest,
  sendMessage,
);

router.get(
  "/:id/reports",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getReports,
);

router.post(
  "/:id/reports",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(generateReportSchema),
  generateReport,
);

router.get(
  "/:id/performance",
  authorize(
    UserRole.COOPERATIVE,
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  getCooperativePerformance,
);

router.get(
  "/:id/performance/export",
  authorize(
    UserRole.COOPERATIVE,
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  exportPerformanceReport,
);

router.get(
  "/:id/analytics",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getAnalytics,
);

router.get(
  "/:id/farmers/import-template",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getFarmerImportTemplate,
);

router.post(
  "/:id/farmers/import",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  uploadSpreadsheet.single("file"),
  importFarmers,
);

router.get(
  "/:id/farmers/:farmerId",
  authorize(
    UserRole.COOPERATIVE,
    UserRole.OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  getFarmerDetail,
);

router.post(
  "/:id/join-request",
  authorize(UserRole.FARMER),
  submitJoinRequest,
);

router.get(
  "/:id/join-requests",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getJoinRequests,
);

router.patch(
  "/:id/join-requests/:requestId/approve",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  approveJoinRequest,
);

router.patch(
  "/:id/join-requests/:requestId/reject",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  rejectJoinRequest,
);

router.get(
  "/:id/activities/:activityId/attendees",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getEventAttendees,
);

router.post(
  "/:id/activities/:activityId/attendees",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  markAttendance,
);

router.delete(
  "/:id/activities/:activityId/attendees/:attendeeId",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  removeAttendee,
);

router.patch(
  "/:id/distributions/:distributionId",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(updateDistributionStatusSchema),
  updateDistributionStatus,
);

// Member Dues
router.get(
  "/:id/dues",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getDues,
);

router.post(
  "/:id/dues",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(createDueSchema),
  createDue,
);

router.patch(
  "/:id/dues/:dueId",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(updateDueSchema),
  updateDue,
);

router.delete(
  "/:id/dues/:dueId",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  deleteDue,
);

// Cooperative Expenses
router.get(
  "/:id/expenses",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getExpenses,
);

router.post(
  "/:id/expenses",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(createExpenseSchema),
  createExpense,
);

router.delete(
  "/:id/expenses/:expenseId",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  deleteExpense,
);

// Event Reminders
router.post(
  "/:id/activities/:activityId/remind",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  sendEventReminder,
);

export default router;
