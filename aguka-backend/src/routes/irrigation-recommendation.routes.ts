import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getRecommendations,
  acceptRecommendation,
} from "../controllers/irrigation-recommendation.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  asyncHandler(getRecommendations),
);

router.post(
  "/accept",
  authenticate,
  asyncHandler(acceptRecommendation),
);

export default router;