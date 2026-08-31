import { Router } from "express";
import { ussdCallback, ussdEvents } from "../controllers/sms.controller.js";
import { ussdRateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.post("/ussd", ussdRateLimiter, ussdCallback);
router.post("/events", ussdRateLimiter, ussdEvents);

export default router;
