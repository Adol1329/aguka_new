import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getPosts,
  getPostById,
  createPost,
  likePost,
  addComment,
} from "../controllers/forum.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(getPosts));
router.get("/:id", asyncHandler(getPostById));
router.post("/", asyncHandler(createPost));
router.post("/:id/like", asyncHandler(likePost));
router.post("/:id/comments", asyncHandler(addComment));

export default router;
