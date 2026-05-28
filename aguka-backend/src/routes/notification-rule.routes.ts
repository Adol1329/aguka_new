import { Router } from "express";
import {
  getRules,
  createRule,
  updateRule,
  deleteRule,
} from "../controllers/notification-rule.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Notification rules
router.get("/rules", authenticate, getRules);
router.post("/rules", authenticate, createRule);
router.put("/rules/:id", authenticate, updateRule);
router.delete("/rules/:id", authenticate, deleteRule);

export default router;
