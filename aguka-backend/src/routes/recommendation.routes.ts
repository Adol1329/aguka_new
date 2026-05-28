import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { recommendationController } from "../controllers/recommendation.controller.js";

const router = Router();

// Get recommendations for the authenticated farmer
router.get(
  "/",
  authenticate,
  asyncHandler(recommendationController.getRecommendations),
);

// Accept a recommendation
router.post(
  "/accept",
  authenticate,
  asyncHandler(recommendationController.acceptRecommendation),
);

// Dismiss a recommendation
router.post(
  "/dismiss",
  authenticate,
  asyncHandler(recommendationController.dismissRecommendation),
);

export default router;