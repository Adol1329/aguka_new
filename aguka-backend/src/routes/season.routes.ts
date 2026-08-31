import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { getSeasons } from "../controllers/season.controller.js";

const router = Router();

router.get("/", authenticate, asyncHandler(getSeasons));

export default router;
