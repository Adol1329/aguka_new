import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { rateLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  initiatePayment,
  confirmPayment,
  getPaymentStatus,
  getUserPayments,
  handleMobileMoneyCallback,
  refundPayment,
  getPaymentMethods,
} from "../controllers/payment.controller.js";

const router = Router();

// Public callback endpoint for mobile money providers
router.post("/callback", handleMobileMoneyCallback);

// All other payment routes require authentication
router.use(authenticate);

// Initiate a new payment
router.post(
  "/initiate",
  rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 5 }),
  initiatePayment,
);

// Confirm payment with OTP
router.post(
  "/:paymentId/confirm",
  rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 5 }),
  confirmPayment,
);

// Get payment status
router.get("/:paymentId/status", getPaymentStatus);

// Get user's payment history
router.get("/history", getUserPayments);

// Refund a payment
router.post(
  "/:paymentId/refund",
  rateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 3 }),
  refundPayment,
);

// Get available payment methods
router.get("/methods", getPaymentMethods);

export default router;
