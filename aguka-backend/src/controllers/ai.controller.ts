import { Request, Response } from "express";
import { aiEngine, SensorSnapshot } from "../services/ai-engine.service.js";
import { logger } from "../utils/logger.js";
import { prisma } from "../prisma.js";

export const aiController = {
  /**
   * POST /api/ai/analyze
   * Analyze farm using latest live database records for the authenticated farmer.
   */
  async analyzeFarm(req: Request, res: Response) {
    try {
      const farmerId = (req as any).user?.id;
      if (!farmerId) return res.status(401).json({ success: false, error: "Unauthorized" });

      const recommendations = await aiEngine.analyzeFarm(farmerId);
      return res.json({
        success: true,
        data: {
          recommendations,
          generatedAt: new Date().toISOString(),
          count: recommendations.length,
        },
      });
    } catch (err) {
      logger.error("aiController.analyzeFarm:", err);
      return res.status(500).json({ success: false, error: "AI analysis failed" });
    }
  },

  /**
   * POST /api/ai/recommendations
   * Analyze a user-submitted IoT payload and return instant AI recommendations.
   * Body: SensorSnapshot fields
   */
  async analyzePayload(req: Request, res: Response) {
    try {
      const farmerId = (req as any).user?.id;
      if (!farmerId) return res.status(401).json({ success: false, error: "Unauthorized" });

      const payload = req.body as SensorSnapshot;

      // Basic validation
      const required: (keyof SensorSnapshot)[] = [
        "soilMoisture",
        "temperature",
        "humidity",
        "rainfallProbability",
        "cropType",
      ];
      const missing = required.filter((k) => payload[k] === undefined || payload[k] === null);
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missing.join(", ")}`,
        });
      }

      const recommendations = aiEngine.analyzePayload(farmerId, {
        ...payload,
        rainfall3DayMm: payload.rainfall3DayMm ?? 0,
        farmSize: payload.farmSize ?? 1,
      });

      return res.json({
        success: true,
        data: {
          recommendations,
          inputSnapshot: payload,
          generatedAt: new Date().toISOString(),
          count: recommendations.length,
        },
      });
    } catch (err) {
      logger.error("aiController.analyzePayload:", err);
      return res.status(500).json({ success: false, error: "AI analysis failed" });
    }
  },

  /**
   * GET /api/ai/farm/:id
   * Get the stored recommendations for a specific farm (admin/officer use).
   */
  async getFarmRecommendations(req: Request, res: Response) {
    try {
      const targetFarmerId = req.params.id;
      const user = (req as any).user;

      // Only admin, officer, or the farmer themselves can access
      const allowedRoles = ["admin", "officer", "super_admin", "cooperative"];
      if (user?.id !== targetFarmerId && !allowedRoles.includes(user?.role)) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }

      const stored = await prisma.recommendation.findMany({
        where: {
          farmerId: targetFarmerId,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { generatedAt: "desc" },
        take: 20,
      });

      return res.json({ success: true, data: stored });
    } catch (err) {
      logger.error("aiController.getFarmRecommendations:", err);
      return res.status(500).json({ success: false, error: "Failed to fetch recommendations" });
    }
  },

  /**
   * GET /api/ai/cooperative-analysis
   * Cooperative-level performance AI analytics.
   * Officers and cooperative managers only.
   */
  async cooperativeAnalysis(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const allowedRoles = ["admin", "officer", "super_admin", "cooperative"];
      if (!allowedRoles.includes(user?.role)) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }

      const cooperativeId = req.query.cooperativeId as string | undefined;
      const result = await aiEngine.analyzeCooperative(cooperativeId);
      return res.json({ success: true, data: result });
    } catch (err) {
      logger.error("aiController.cooperativeAnalysis:", err);
      return res.status(500).json({ success: false, error: "Cooperative analysis failed" });
    }
  },

  /**
   * GET /api/ai/history
   * Returns past AI recommendations for the authenticated farmer.
   */
  async getHistory(req: Request, res: Response) {
    try {
      const farmerId = (req as any).user?.id;
      if (!farmerId) return res.status(401).json({ success: false, error: "Unauthorized" });

      const limit = Math.min(Number(req.query.limit ?? 10), 50);
      const category = req.query.category as string | undefined;

      const history = await prisma.recommendation.findMany({
        where: {
          farmerId,
          ...(category ? { type: category } : {}),
        },
        orderBy: { generatedAt: "desc" },
        take: limit,
      });

      return res.json({ success: true, data: history });
    } catch (err) {
      logger.error("aiController.getHistory:", err);
      return res.status(500).json({ success: false, error: "Failed to fetch history" });
    }
  },
};
