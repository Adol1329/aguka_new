import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";
import {
  startSimulation,
  stopSimulation,
  getSimulationStatus,
  getSimulationConfig,
  stopAllSimulations,
  getIrrigationStatus,
  getIrrigationRules,
  addIrrigationRule,
  removeIrrigationRule,
  toggleAutomation,
  manualIrrigationControl,
  triggerSimulatedAlert,
  getSimulatedData,
} from "../controllers/simulation.controller.js";

const router = Router();

router.post("/trigger-alert", authenticate, triggerSimulatedAlert);

// Simulation control routes
router.post(
  "/start",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  startSimulation,
);
router.post(
  "/stop/:farmId",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  stopSimulation,
);
router.get("/status", authenticate, getSimulationStatus);
router.get("/data/:farmId", authenticate, getSimulatedData);
router.get("/config/:farmId", authenticate, getSimulationConfig);
router.post(
  "/stop-all",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  stopAllSimulations,
);

// Irrigation control routes
router.get("/irrigation/status", authenticate, getIrrigationStatus);
router.get("/irrigation/rules", authenticate, getIrrigationRules);
router.post(
  "/irrigation/rules",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  addIrrigationRule,
);
router.delete(
  "/irrigation/rules/:ruleId",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  removeIrrigationRule,
);
router.post(
  "/irrigation/automation",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  toggleAutomation,
);
router.post("/irrigation/manual", authenticate, manualIrrigationControl);

export default router;
