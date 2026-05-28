import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";
import {
  getOfficerAdvisories,
  createAdvisory,
  getOfficerRisks,
  getOfficerAnalysis,
  getFarmerAnalysis,
  getAssignedFarmersPerformance,
} from "../controllers/extension-officer.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.OFFICER));

router.get("/advisories", getOfficerAdvisories);
router.post("/advisories", createAdvisory);
router.get("/risks", getOfficerRisks);
router.get("/analysis", getOfficerAnalysis);
router.get("/analysis/farmer/:farmerId", getFarmerAnalysis);
router.get("/analysis/performance", getAssignedFarmersPerformance);

export default router;
