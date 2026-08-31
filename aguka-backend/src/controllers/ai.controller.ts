import { Response, NextFunction } from "express";
import { aiEngine, SensorSnapshot } from "../services/ai-engine.service.js";
import { prisma } from "../prisma.js";
import { RequestWithUser } from "../types/index.js";

export const aiController = {
  async analyzeFarm(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user?.sub;
      if (!farmerId) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        });
        return;
      }

      const recommendations = await aiEngine.analyzeFarm(farmerId);
      res.json({
        success: true,
        data: {
          recommendations,
          generatedAt: new Date().toISOString(),
          count: recommendations.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async analyzePayload(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const farmerId = req.user?.sub;
      if (!farmerId) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        });
        return;
      }

      const payload = req.body as SensorSnapshot;
      const required: (keyof SensorSnapshot)[] = [
        "soilMoisture",
        "temperature",
        "humidity",
        "rainfallProbability",
        "cropType",
      ];
      const missing = required.filter(
        (k) => payload[k] === undefined || payload[k] === null,
      );
      if (missing.length > 0) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Missing required fields: ${missing.join(", ")}`,
          },
        });
        return;
      }

      const recommendations = aiEngine.analyzePayload(farmerId, {
        ...payload,
        rainfall3DayMm: payload.rainfall3DayMm ?? 0,
        farmSize: payload.farmSize ?? 1,
      });

      res.json({
        success: true,
        data: {
          recommendations,
          inputSnapshot: payload,
          generatedAt: new Date().toISOString(),
          count: recommendations.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getFarmRecommendations(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const targetFarmerId = req.params.id;
      const user = req.user;
      const allowedRoles = ["admin", "officer", "super_admin", "cooperative"];
      if (
        user?.sub !== targetFarmerId &&
        !allowedRoles.includes(user?.role as string)
      ) {
        res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Insufficient permissions" },
        });
        return;
      }

      const stored = await prisma.recommendation.findMany({
        where: {
          farmerId: targetFarmerId,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { generatedAt: "desc" },
        take: 20,
      });
      res.json({ success: true, data: stored });
    } catch (err) {
      next(err);
    }
  },

  async cooperativeAnalysis(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = req.user;
      const allowedRoles = ["admin", "officer", "super_admin", "cooperative"];
      if (!allowedRoles.includes(user?.role as string)) {
        res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Insufficient permissions" },
        });
        return;
      }

      let cooperativeId = req.query.cooperativeId as string | undefined;

      if (user?.role === "cooperative") {
        // Cooperative managers can only ever see their own cooperative's data —
        // ignore any cooperativeId they pass in and use the one from their session.
        cooperativeId = user.cooperativeId;
        if (!cooperativeId) {
          res.status(404).json({
            success: false,
            error: { code: "NOT_FOUND", message: "You are not assigned to a cooperative" },
          });
          return;
        }
      }

      const result = await aiEngine.analyzeCooperative(cooperativeId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getHistory(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user?.sub;
      if (!farmerId) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        });
        return;
      }

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
      res.json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  },
};
