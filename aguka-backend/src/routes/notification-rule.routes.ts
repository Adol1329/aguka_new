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
router.get("/", authenticate, getRules);
router.post("/", authenticate, createRule);
router.put("/:id", authenticate, updateRule);
router.delete("/:id", authenticate, deleteRule);

export default router;
