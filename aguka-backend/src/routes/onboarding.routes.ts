import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";
import * as controller from "../controllers/onboarding.controller.js";

const router = Router();

router.use(authenticate);

router.post("/farmer", authorize(UserRole.FARMER), controller.onboardFarmer);
router.post("/officer", authorize(UserRole.OFFICER), controller.onboardOfficer);
router.post("/cooperative", authorize(UserRole.COOPERATIVE), controller.onboardCooperative);

export default router;
