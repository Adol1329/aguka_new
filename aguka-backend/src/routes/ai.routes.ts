import { Router } from "express";
import { aiController } from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all AI routes
router.use(authenticate);

// 1. Analyze the authenticated farmer's farm using live DB records
router.post("/analyze", aiController.analyzeFarm);

// 2. Analyze user-submitted IoT payload instantly
router.post("/recommendations", aiController.analyzePayload);

// 3. Get history of recommendations for authenticated farmer
router.get("/history", aiController.getHistory);

// 4. Get stored recommendations for a specific farm (for managers/officers)
router.get("/farm/:id", aiController.getFarmRecommendations);

// 5. Get cooperative-level analysis (for managers/officers)
router.get("/cooperative-analysis", aiController.cooperativeAnalysis);

export default router;
