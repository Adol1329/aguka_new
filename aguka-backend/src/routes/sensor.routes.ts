import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { ingestTelemetry } from "../controllers/sensor.controller.js";

const router = Router();

/**
 * IoT Ingestion Endpoint
 * Protected by a static Master Secret for simplicity in the demo
 */
router.post("/ingest", asyncHandler(ingestTelemetry));

export default router;
