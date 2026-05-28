import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import farmerRoutes from "./farmer.routes.js";
import soilRoutes from "./soil.routes.js";
import superAdminRoutes from "./superadmin.routes.js";
import cooperativeRoutes from "./cooperative.routes.js";
import adminRoutes from "./admin.routes.js";
import auditRoutes from "./audit.routes.js";
import weatherRoutes from "./weather.routes.js";
import irrigationRoutes from "./irrigation.routes.js";
import sensorRoutes from "./sensor.routes.js";
import iotRoutes from "./iot.routes.js";
import kpiRoutes from "./kpi.routes.js";
import smsRoutes from "./sms.routes.js";
import reportRoutes from "./report.routes.js";
import marketRoutes from "./market.routes.js";
import paymentRoutes from "./payment.routes.js";
import feedbackRoutes from "./feedback.routes.js";
import simulationRoutes from "./simulation.routes.js";
import locationRoutes from "./location.routes.js";
import ussdRoutes from "./ussd_routes.js";
import searchRoutes from "./search.routes.js";
import activityRoutes from "./activity.routes.js";
import notificationRoutes from "./notification.routes.js";
import notificationRuleRoutes from "./notification-rule.routes.js";
import forumRoutes from "./forum.routes.js";
import officerRoutes from "./officer.routes.js";
import pestDiseaseRoutes from "./pest-disease.routes.js";
import livestockRoutes from "./livestock.routes.js";
import irrigationRecommendationRoutes from "./irrigation-recommendation.routes.js";
import recommendationRoutes from "./recommendation.routes.js";
import onboardingRoutes from "./onboarding.routes.js";
import aiRoutes from "./ai.routes.js";

import { config } from "../config/index.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/search", searchRoutes);
router.use("/superadmin", superAdminRoutes);
router.use("/users", userRoutes);

// Farmers routes (ensuring both plural and singular aliases)
router.use("/farmers", farmerRoutes);
router.use("/farmer", farmerRoutes);

router.use("/soil", soilRoutes);
router.use("/cooperatives", cooperativeRoutes);
router.use("/audit", auditRoutes);
router.use("/weather", weatherRoutes);
router.use("/irrigation", irrigationRoutes);
router.use("/sensors", sensorRoutes);
router.use("/sensors/ingest", iotRoutes);
router.use("/kpi", kpiRoutes);
router.use("/sms", smsRoutes);
router.use("/reports", reportRoutes);
router.use("/market", marketRoutes);
router.use("/payment", paymentRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/simulation", simulationRoutes);
router.use("/location", locationRoutes);
router.use("/locations", locationRoutes);
router.use("/ussd", ussdRoutes);
router.use("/activities", activityRoutes);

// Forum routes ( pluralized )
router.use("/forums", forumRoutes);
router.use("/forum", forumRoutes);

// Officer routes
router.use("/officer", officerRoutes);
router.use("/officers", officerRoutes);

router.use("/notifications", notificationRoutes);
router.use("/notification-rules", notificationRuleRoutes);
router.use("/pest-disease", pestDiseaseRoutes);
router.use("/livestock", livestockRoutes);
router.use("/irrigation-recommendation", irrigationRecommendationRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/admin", adminRoutes);
router.use("/ai", aiRoutes);

import { prisma } from "../prisma.js";

router.get("/stats/public", async (_req, res) => {
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

router.get("/health", (_req, res) => {
  // #region agent log
  fetch("http://127.0.0.1:7646/ingest/8e7223a1-1e67-4704-b579-50d84bc12fc1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8574fc",
    },
    body: JSON.stringify({
      sessionId: "8574fc",
      runId: "pre-fix",
      hypothesisId: "H2",
      location: "routes/index.ts:/health",
      message: "v1 health handler executed",
      data: { version: config.apiVersion },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  res.json({
    success: true,
    data: {
      status: "healthy",
      version: config.apiVersion,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
