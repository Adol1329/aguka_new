import { Router } from "express";
import { body } from "express-validator";
import {
  getMyCooperative,
  getCooperative,
  getCooperativeStats,
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
  bookResource,
  getResourceBookings,
  approveBooking,
  rejectBooking,
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
  getBulkOrders,
  createBulkOrder,
  getCooperativePerformance,
} from "../controllers/cooperative.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { UserRole } from "../types/index.js";

const router = Router();

router.use(authenticate);

router.get("/me", getMyCooperative);

router.get(
  "/:id",
  authorize(UserRole.COOPERATIVE, UserRole.OFFICER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getCooperative,
);

router.get(
  "/:id/stats",
  authorize(UserRole.COOPERATIVE, UserRole.OFFICER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getCooperativeStats,
);

router.get(
  "/:id/members",
  authorize(UserRole.COOPERATIVE, UserRole.OFFICER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
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

router.get("/:id/activities", getActivities);

router.post(
  "/:id/activities",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  [
    body("title").isString().notEmpty().withMessage("Title is required"),
    body("activityType")
      .isIn(["meeting", "training", "harvest", "planting", "other"])
      .withMessage("Invalid activity type"),
    body("scheduledAt").isISO8601().withMessage("Valid date required"),
  ],
  validateRequest,
  createActivity,
);

router.patch(
  "/:id/activities/:activityId",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  updateActivity,
);

router.delete(
  "/:id/activities/:activityId",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  deleteActivity,
);

router.get("/:id/resources", getResources);

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

router.post("/:id/resources/:resourceId/book", bookResource);

router.get(
  "/:id/resource-bookings",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getResourceBookings,
);

router.patch(
  "/:id/resource-bookings/:bookingId/approve",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  approveBooking,
);

router.patch(
  "/:id/resource-bookings/:bookingId/reject",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  rejectBooking,
);

router.get("/:id/marketplace", getMarketplace);

router.post(
  "/:id/marketplace",
  [
    body("productName")
      .isString()
      .notEmpty()
      .withMessage("Product name is required"),
    body("quantity").isNumeric().withMessage("Quantity must be a number"),
    body("pricePerUnit").isNumeric().withMessage("Price must be a number"),
  ],
  validateRequest,
  createListing,
);

router.patch("/:id/marketplace/:listingId", updateListing);

router.get("/:id/announcements", getAnnouncements);

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

router.patch("/:id/announcements/:announcementId/read", markAnnouncementRead);

router.get("/:id/messages", getMessages);

router.post(
  "/:id/messages",
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
  generateReport,
);

router.get(
  "/:id/performance",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getCooperativePerformance,
);

router.get(
  "/:id/bulk-orders",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getBulkOrders,
);

router.post(
  "/:id/bulk-orders",
  authorize(UserRole.COOPERATIVE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  createBulkOrder,
);

export default router;
