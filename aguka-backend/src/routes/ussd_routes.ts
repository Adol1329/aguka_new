import { Router } from "express";
import { ussdCallback } from "../controllers/sms.controller.js";
import { ussdRateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.post("/ussd", ussdRateLimiter, ussdCallback);
router.post("/events", (_req, res) => {
  res.status(200).send("OK");
});

export default router;
