import { Router } from "express";
import { LocationController } from "../controllers/location.controller.js";

const router = Router();
const locationController = new LocationController();

router.get("/provinces", locationController.getProvinces);
router.get("/districts/:provinceCode", locationController.getDistricts);
router.get("/sectors/:districtCode", locationController.getSectors);
router.get("/cells/:sectorCode", locationController.getCells);
router.get("/villages/:cellCode", locationController.getVillages);

export default router;
