import { Router } from "express";
import {
  registerDevice,
  sendTestNotification,
} from "../controllers/notification.controller.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/notification-rule.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/devices", authenticate, registerDevice);
router.post("/test-push", authenticate, sendTestNotification);

// General Notifications
router.get("/", authenticate, getNotifications);
router.post("/mark-read", authenticate, markAsRead);
router.post("/mark-all-read", authenticate, markAllAsRead);
router.get("/unread-count", authenticate, getUnreadCount);

export default router;
