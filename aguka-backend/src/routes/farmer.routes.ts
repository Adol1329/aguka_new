import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import {
  authenticate,
  authorize,
  authorizeFarmerOrRole,
} from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";
import { getSimulatedData } from "../controllers/simulation.controller.js";
import {
  getProfile,
  updateProfile,
  createProfile,
  getFarmerById,
  listFarmers,
  getAssignedFarmers,
  assignToOfficer,
  getSoilReadings,
  addCrop,
  getCrops,
  getCropGuidance,
  verifyFarmer,
  bulkVerifyFarmers,
} from "../controllers/farmer.controller.js";
import {
  getActivityById,
  getActivityTypes,
  getCurrentFarmerActivities,
  createActivity,
} from "../controllers/activity.controller.js";

const router = Router();

// PROFILE
router.get("/profile", authenticate, asyncHandler(getProfile));

router.post("/profile", authenticate, asyncHandler(createProfile));

router.patch("/profile", authenticate, asyncHandler(updateProfile));

router.put("/profile", authenticate, asyncHandler(updateProfile));

// ACTIVITIES
router.get("/activities", authenticate, asyncHandler(getCurrentFarmerActivities));

router.post("/activities", authenticate, asyncHandler(createActivity));

router.get("/activity-types", authenticate, asyncHandler(getActivityTypes));

router.get("/activities/:id", authenticate, asyncHandler(getActivityById));

// CROPS
router.get("/crops", authenticate, asyncHandler(getCrops));

router.post("/crops", authenticate, asyncHandler(addCrop));

router.get("/crops/:cropId/guidance", authenticate, asyncHandler(getCropGuidance));

router.get("/crops/simulate/:farmId", authenticate, asyncHandler(getSimulatedData));

// ASSIGNMENTS
router.get(
  "/assigned",
  authenticate,
  authorize(UserRole.OFFICER),
  asyncHandler(getAssignedFarmers),
);

// VERIFICATION ROUTES (Admin/SuperAdmin only)
router.patch(
  "/:id/verify",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(verifyFarmer),
);

router.patch(
  "/bulk-verify",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(bulkVerifyFarmers),
);

// GENERAL FARMER ROUTES
router.get(
  "/:id",
  authenticate,
  authorizeFarmerOrRole(
    UserRole.OFFICER,
    UserRole.COOPERATIVE,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  asyncHandler(getFarmerById),
);

router.get(
  "/",
  authenticate,
  authorize(
    UserRole.OFFICER,
    UserRole.COOPERATIVE,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  asyncHandler(listFarmers),
);

router.post(
  "/:id/assign",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(assignToOfficer),
);

router.get(
  "/:id/soil",
  authenticate,
  authorizeFarmerOrRole(
    UserRole.OFFICER,
    UserRole.COOPERATIVE,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  asyncHandler(getSoilReadings),
);

export default router;
