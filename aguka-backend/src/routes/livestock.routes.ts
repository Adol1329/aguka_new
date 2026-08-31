import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  addLivestockSchema,
  updateLivestockSchema,
} from "../validators/livestock.validator.js";
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
router.get("/guidance", authenticate, asyncHandler(getLivestockGuidance));

router.get("/my-livestock", authenticate, asyncHandler(getMyLivestock));

router.get("/", authenticate, asyncHandler(getMyLivestock));

router.get("/stats", authenticate, asyncHandler(getLivestockStats));

router.get("/:livestockId", authenticate, asyncHandler(getLivestockItemGuidance));

router.get(
  "/:livestockId/guidance",
  authenticate,
  asyncHandler(getLivestockItemGuidance),
);

router.post("/", authenticate, validate(addLivestockSchema), asyncHandler(addLivestock));

router.patch("/:livestockId", authenticate, validate(updateLivestockSchema), asyncHandler(updateLivestock));

router.delete("/:livestockId", authenticate, asyncHandler(removeLivestock));

export default router;
