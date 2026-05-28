import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { optionalAuth } from "../middleware/auth.middleware.js";
import {
  ingestSoil,
  ingestSoilBulk,
  ingestWeather,
  updatePumpStatus,
  getStatus,
} from "../controllers/iot.controller.js";

const router = Router();

router.post("/soil", asyncHandler(ingestSoil));

router.post("/soil/bulk", optionalAuth, asyncHandler(ingestSoilBulk));

router.post("/weather", optionalAuth, asyncHandler(ingestWeather));

router.post("/pump/status", optionalAuth, asyncHandler(updatePumpStatus));

router.get("/status", asyncHandler(getStatus));

export default router;
