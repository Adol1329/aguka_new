import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getCurrentWeather,
  getForecast,
} from "../controllers/weather.controller.js";

const router = Router();

router.get("/current", authenticate, asyncHandler(getCurrentWeather));

router.get("/forecast", authenticate, asyncHandler(getForecast));

export default router;
