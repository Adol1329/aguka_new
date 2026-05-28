import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  sendSms,
  sendBulkSms,
  ussdCallback,
  getStatus,
} from "../controllers/sms.controller.js";

const router = Router();

router.post("/send", authenticate, asyncHandler(sendSms));

router.post("/send-bulk", authenticate, asyncHandler(sendBulkSms));

router.post("/ussd/callback", asyncHandler(ussdCallback));

router.get("/status", asyncHandler(getStatus));

export default router;
