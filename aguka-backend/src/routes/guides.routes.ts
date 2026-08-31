import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getGuides,
  getGuideById,
  getGuideFilters,
} from "../controllers/guides.controller.js";

const router = Router();

router.get("/", authenticate, asyncHandler(getGuides));
router.get("/filters", authenticate, asyncHandler(getGuideFilters));
router.get("/:id", authenticate, asyncHandler(getGuideById));

export default router;
