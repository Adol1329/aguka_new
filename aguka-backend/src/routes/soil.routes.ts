import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getReadings,
  getCurrentStatus,
  getAlerts,
  getRecommendations,
  addManualReading,
} from "../controllers/soil.controller.js";

const router = Router();

router.get("/readings", authenticate, asyncHandler(getReadings));

router.get("/readings/current", authenticate, asyncHandler(getCurrentStatus));

router.get("/status", authenticate, asyncHandler(getCurrentStatus));

router.get("/alerts", authenticate, asyncHandler(getAlerts));

router.get("/recommendations", authenticate, asyncHandler(getRecommendations));

router.post("/manual", authenticate, asyncHandler(addManualReading));

export default router;
