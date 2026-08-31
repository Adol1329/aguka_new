import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { UserRole } from "../types/index.js";
import {
  createNoteSchema,
  updateNoteSchema,
} from "../validators/extension-officer.validator.js";
import {
  getOfficerAdvisories,
  createAdvisory,
  getOfficerRisks,
  getOfficerAnalysis,
  getOfficerFieldWork,
  getFarmerAnalysis,
  getAssignedFarmersPerformance,
  getAdvisoryTemplates,
  createAdvisoryTemplate,
  updateAdvisoryTemplate,
  deleteAdvisoryTemplate,
  getAdvisoryStats,
  getFarmerNotes,
  createFarmerNote,
  updateFarmerNote,
  deleteFarmerNote,
  getOfficerDashboard,
} from "../controllers/extension-officer.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.OFFICER));

router.get("/dashboard", getOfficerDashboard);
router.get("/advisories", getOfficerAdvisories);
router.post("/advisories", createAdvisory);
router.get("/risks", getOfficerRisks);
router.get("/analysis", getOfficerAnalysis);
router.get("/field-work", getOfficerFieldWork);
router.get("/analysis/farmer/:farmerId", getFarmerAnalysis);
router.get("/analysis/performance", getAssignedFarmersPerformance);

// Advisory templates
router.get("/templates", getAdvisoryTemplates);
router.post("/templates", createAdvisoryTemplate);
router.patch("/templates/:id", updateAdvisoryTemplate);
router.delete("/templates/:id", deleteAdvisoryTemplate);

// Advisory stats
router.get("/advisories/stats", getAdvisoryStats);

// Field visit notes
router.get("/farmers/:farmerId/notes", getFarmerNotes);
router.post("/farmers/:farmerId/notes", validate(createNoteSchema), createFarmerNote);
router.patch("/farmers/:farmerId/notes/:id", validate(updateNoteSchema), updateFarmerNote);
router.delete("/farmers/:farmerId/notes/:id", deleteFarmerNote);

export default router;
