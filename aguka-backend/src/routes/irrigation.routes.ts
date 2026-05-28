import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getSchedules,
  getLogs,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  triggerIrrigation,
  stopIrrigation,
  getStatus,
  controlIrrigation,
} from "../controllers/irrigation.controller.js";

const router = Router();

router.get("/schedules", authenticate, asyncHandler(getSchedules));

router.get("/logs", authenticate, asyncHandler(getLogs));

router.get("/status", authenticate, asyncHandler(getStatus));

router.post("/control", authenticate, asyncHandler(controlIrrigation));

router.post("/schedules", authenticate, asyncHandler(createSchedule));

router.patch("/schedules/:id", authenticate, asyncHandler(updateSchedule));

router.delete("/schedules/:id", authenticate, asyncHandler(deleteSchedule));

router.post("/trigger", authenticate, asyncHandler(triggerIrrigation));

router.post("/stop", authenticate, asyncHandler(stopIrrigation));

export default router;
