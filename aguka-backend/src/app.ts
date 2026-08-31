import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";
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
import { authenticate, authorize } from "./middleware/auth.middleware.js";
import { UserRole } from "./types/index.js";

const app = express();
const server = createServer(app);

// Initialize real-time sync
const realTimeSync = new RealTimeSync(server, sensorEngine, irrigationLogic);

import { setSocketInstance } from "./services/notification-rule.service.js";
import { setForumRealTimeSync } from "./services/forum.service.js";
setSocketInstance(realTimeSync.getIO());
setForumRealTimeSync(realTimeSync);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: [
          "'self'",
          "https://api.africastalking.com",
          "ws://localhost:3000",
          "http://localhost:3000",
          "http://localhost:8080",
          "http://localhost:5173",
        ],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
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

app.use(requestIdMiddleware);
app.use(loggingMiddleware);
app.use(timingMiddleware);
app.use(performanceMonitoring);

import { prisma } from "./prisma.js";
import cron from "node-cron";
import { cleanAuditLogs } from "./jobs/cleanAuditLogs.js";
import { cleanRevokedTokens } from "./jobs/cleanRevokedTokens.js";
import { createDatabaseBackup } from "./services/backup.service.js";
import { syncWeather, syncMarketPrices } from "./jobs/syncServices.js";
import { systemHealthHeartbeat } from "./jobs/systemHealthHeartbeat.js";

// Schedule daily audit log cleanup at 03:00
cron.schedule("0 3 * * *", async () => {
  try {
    await cleanAuditLogs();
  } catch (err) {
    console.error("Audit cleanup cron failed:", err);
  }
});

// Schedule revoked token cleanup every hour
cron.schedule("0 * * * *", async () => {
  try {
    await cleanRevokedTokens();
  } catch (err) {
    console.error("Token cleanup cron failed:", err);
  }
});

// Scheduled backup: runs every hour, checks frequency and time window
cron.schedule("0 * * * *", async () => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "backup_schedule" },
    });
    if (!setting?.value) return;
    const schedule = JSON.parse(setting.value);
    if (!schedule.enabled) return;
    const now = new Date();
    const [hours, minutes] = (schedule.time || "02:00").split(":").map(Number);
    const freq: string = (schedule.frequency || "daily").toLowerCase();
    const timeMatch =
      now.getHours() === hours &&
      now.getMinutes() >= minutes &&
      now.getMinutes() < minutes + 5;
    if (!timeMatch) return;
    if (freq === "weekly" && now.getDay() !== 0) return;
    if (freq === "monthly" && now.getDate() !== 1) return;
    await createDatabaseBackup("system");

    // Enforce backup retention
    if (schedule.retention && schedule.retention !== "unlimited") {
      const maxAgeDays = parseInt(schedule.retention, 10);
      if (Number.isFinite(maxAgeDays) && maxAgeDays > 0) {
        const cutoff = new Date(Date.now() - maxAgeDays * 86400000);
        const oldBackups = await prisma.backup.findMany({
          where: { createdAt: { lt: cutoff }, status: "COMPLETED" },
        });
        for (const b of oldBackups) {
          try {
            if (b.filePath && fs.existsSync(b.filePath))
              fs.unlinkSync(b.filePath);
          } catch {
            /* ignore */
          }
        }
        await prisma.backup.deleteMany({
          where: { id: { in: oldBackups.map((b: any) => b.id) } },
        });
      }
    }

    console.log(`Automated ${freq} backup completed`);
  } catch (err) {
    console.error("Scheduled backup failed:", err);
  }
});

// Weather sync: every 15 minutes when enabled
cron.schedule("*/15 * * * *", async () => {
  try {
    await syncWeather();
  } catch (err) {
    console.error("Weather sync cron failed:", err);
  }
});

// Market price sync: daily at 08:00 when enabled
cron.schedule("0 8 * * *", async () => {
  try {
    await syncMarketPrices();
  } catch (err) {
    console.error("Market sync cron failed:", err);
  }
});

// System health heartbeat: every minute
cron.schedule("* * * * *", async () => {
  try {
    await systemHealthHeartbeat();
  } catch (err) {
    console.error("System health heartbeat failed:", err);
  }
});

app.get("/api/stats/public", async (_req, res) => {
  try {
    const [totalFarmers, totalCooperatives, farmerDistricts] =
      await Promise.all([
        prisma.user.count({ where: { role: "farmer" } }),
        prisma.user.count({ where: { role: "cooperative" } }),
        prisma.farmerProfile.groupBy({
          by: ["district"],
        }),
      ]);
    const districtsCount =
      farmerDistricts.filter((d) => d.district).length || 5;

    return res.json({
      totalFarmers,
      totalCooperatives,
      districtsCount,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch stats" });
  }
});

app.use(`/api/${config.apiVersion}`, routes);

// Add monitoring endpoints (authenticated, admin+ only)
app.get(
  `/api/${config.apiVersion}/monitoring/metrics`,
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getMonitoringData,
);
app.get(
  `/api/${config.apiVersion}/monitoring/health`,
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getHealthStatus,
);
app.get(
  `/api/${config.apiVersion}/monitoring/errors`,
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getErrorData,
);
app.get(
  `/api/${config.apiVersion}/monitoring/errors/:errorId`,
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getErrorById,
);

app.use(notFoundHandler);

// Add error tracking before error handler
app.use(errorTracking);
app.use(errorHandler);

export { app, server, realTimeSync };
