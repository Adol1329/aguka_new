import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getLivestockGuidance,
  getLivestockItemGuidance,
  getMyLivestock,
  addLivestock,
  updateLivestock,
  removeLivestock,
  getLivestockStats,
} from "../controllers/livestock.controller.js";

const router = Router();

// Livestock guidance and management
router.get(
  "/guidance",
  authenticate,
  asyncHandler(getLivestockGuidance),
);

router.get(
  "/my-livestock",
  authenticate,
  asyncHandler(getMyLivestock),
);

router.get(
  "/",
  authenticate,
  asyncHandler(getMyLivestock),
);

router.get(
  "/:livestockId/guidance",
  authenticate,
  asyncHandler(getLivestockItemGuidance),
);

router.post(
  "/",
  authenticate,
  asyncHandler(addLivestock),
);

router.patch(
  "/:livestockId",
  authenticate,
  asyncHandler(updateLivestock),
);

router.delete(
  "/:livestockId",
  authenticate,
  asyncHandler(removeLivestock),
);

router.get(
  "/stats",
  authenticate,
  asyncHandler(getLivestockStats),
);

export default router;
