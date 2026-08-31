import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { recommendationController } from "../controllers/recommendation.controller.js";

const router = Router();

// Get recommendations for the authenticated farmer
router.get(
  "/",
  authenticate,
  asyncHandler((req, res, next) =>
    recommendationController.getRecommendations(req, res, next),
  ),
);

// Accept a recommendation
router.post(
  "/accept",
  authenticate,
  asyncHandler((req, res, next) =>
    recommendationController.acceptRecommendation(req, res, next),
  ),
);

// Dismiss a recommendation
router.post(
  "/dismiss",
  authenticate,
  asyncHandler((req, res, next) =>
    recommendationController.dismissRecommendation(req, res, next),
  ),
);

export default router;
