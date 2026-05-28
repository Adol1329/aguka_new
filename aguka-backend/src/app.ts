import express from "express";
import { createServer } from "http";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/index.js";
import routes from "./routes/index.js";
import {
  errorHandler,
  notFoundHandler,
  timingMiddleware,
  globalRateLimiter,
  requestIdMiddleware,
  loggingMiddleware,
} from "./middleware/index.js";
import {
  performanceMonitoring,
  getMonitoringData,
  getHealthStatus,
} from "./middleware/monitoring.middleware.js";
import {
  errorTracking,
  getErrorData,
  getErrorById,
} from "./middleware/error-tracking.middleware.js";
import { sensorEngine } from "./simulation/sensor-engine.js";
import { irrigationLogic } from "./simulation/irrigation-logic.js";
import { RealTimeSync } from "./simulation/real-time-sync.js";

const app = express();
const server = createServer(app);

// Initialize real-time sync
const realTimeSync = new RealTimeSync(server, sensorEngine, irrigationLogic);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  }),
);

// Apply global rate limiting to all requests
app.use(globalRateLimiter);
app.use(
  cors({
    origin: [
      config.frontendUrl,
      "http://localhost:5173",
      "http://localhost:8080",
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// #region agent log
app.use((req, _res, next) => {
  const p = req.path;
  if (
    p.includes("health") ||
    p.includes("monitoring") ||
    p === "/api/stats/public"
  ) {
    fetch("http://127.0.0.1:7646/ingest/8e7223a1-1e67-4704-b579-50d84bc12fc1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "8574fc",
      },
      body: JSON.stringify({
        sessionId: "8574fc",
        runId: "pre-fix",
        hypothesisId: "H3",
        location: "app.ts:request-probe",
        message: "Public-path request entered app",
        data: { method: req.method, path: p, originalUrl: req.originalUrl },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  next();
});
// #endregion

app.use(requestIdMiddleware);
app.use(loggingMiddleware);
app.use(timingMiddleware);
app.use(performanceMonitoring);

import { prisma } from "./prisma.js";

app.get("/api/stats/public", async (_req, res) => {
  try {
    const [totalFarmers, totalCooperatives, farmerDistricts] = await Promise.all([
      prisma.user.count({ where: { role: "farmer" } }),
      prisma.user.count({ where: { role: "cooperative" } }),
      prisma.farmerProfile.groupBy({
        by: ["district"],
      }),
    ]);
    const districtsCount = farmerDistricts.filter(d => d.district).length || 5;

    return res.json({
      totalFarmers,
      totalCooperatives,
      districtsCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
});

app.use(`/api/${config.apiVersion}`, routes);

// Add monitoring endpoints
app.get(`/api/${config.apiVersion}/monitoring/metrics`, getMonitoringData);
app.get(`/api/${config.apiVersion}/monitoring/health`, getHealthStatus);
app.get(`/api/${config.apiVersion}/monitoring/errors`, getErrorData);
app.get(`/api/${config.apiVersion}/monitoring/errors/:errorId`, getErrorById);

app.use(notFoundHandler);

// Add error tracking before error handler
app.use(errorTracking);
app.use(errorHandler);

export { app, server, realTimeSync };
