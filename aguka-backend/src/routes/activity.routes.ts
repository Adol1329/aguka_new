import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import {
  authenticate,
  authorizeFarmerOrRole,
} from "../middleware/auth.middleware.js";
import {
  getActivities,
  getFarmerActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../controllers/activity.controller.js";

const router = Router();

// Get activities for a specific farmer
router.get(
  "/:farmerId/activities",
  authenticate,
  authorizeFarmerOrRole(), // Allow farmer to access their own activities or authorized roles
  asyncHandler(getFarmerActivities),
);

// Get activities (general listing with filters)
router.get("/", authenticate, asyncHandler(getActivities));

// Create a new activity
router.post("/", authenticate, asyncHandler(createActivity));

// Update an activity
router.put("/:id", authenticate, asyncHandler(updateActivity));

// Delete an activity
router.delete("/:id", authenticate, asyncHandler(deleteActivity));

export default router;
