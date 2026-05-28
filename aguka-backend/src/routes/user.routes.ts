import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";
import {
  getMyProfile,
  updateMyProfile,
  getMyFarm,
  getUserById,
  listUsers,
  updateUserRole,
  updateUserStatus,
  bulkUpdateStatus,
  uploadAvatarController,
} from "../controllers/user.controller.js";
import { uploadAvatar } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/me", authenticate, asyncHandler(getMyProfile));

router.patch("/me", authenticate, asyncHandler(updateMyProfile));

router.post(
  "/me/avatar",
  authenticate,
  uploadAvatar.single("avatar"),
  asyncHandler(uploadAvatarController),
);

router.get("/me/farms", authenticate, asyncHandler(getMyFarm));

router.get(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getUserById),
);

router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COOPERATIVE),
  asyncHandler(listUsers),
);

router.patch(
  "/:id/role",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(updateUserRole),
);

router.patch(
  "/:id/status",
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  asyncHandler(updateUserStatus),
);

router.patch(
  "/bulk/status",
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  asyncHandler(bulkUpdateStatus),
);

export default router;
