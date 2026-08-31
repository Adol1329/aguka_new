import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";
import {
  getPosts,
  getPostById,
  createPost,
  likePost,
  addComment,
  markAsSeen,
  reportPost,
  pinPost,
  verifyAnswer,
  promoteToKnowledgeBase,
  deletePost,
} from "../controllers/forum.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(getPosts));
router.get("/:id", asyncHandler(getPostById));
router.post("/", asyncHandler(createPost));
router.post("/:id/like", asyncHandler(likePost));
router.post("/:id/comments", asyncHandler(addComment));
router.post("/:id/seen", asyncHandler(markAsSeen));
router.post("/:id/report", asyncHandler(reportPost));

// Admin / Moderator routes
router.post(
  "/:id/pin",
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COOPERATIVE),
  asyncHandler(pinPost),
);

router.post(
  "/comments/:commentId/verify",
  authorize(UserRole.OFFICER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(verifyAnswer),
);

router.post(
  "/:id/promote",
  authorize(UserRole.OFFICER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(promoteToKnowledgeBase),
);

router.delete("/:id", asyncHandler(deletePost)); // Controller handles own vs any post logic

export default router;
