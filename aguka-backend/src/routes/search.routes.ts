import { Router } from "express";
import { globalSearch } from "../controllers/search.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, globalSearch);

export default router;
