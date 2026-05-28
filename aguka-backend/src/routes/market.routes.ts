import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getCurrentPrices,
  getPriceHistory,
  getPriceAlerts,
  createPriceAlert,
  getMarketInsights,
  getRecommendedMarkets,
} from "../controllers/market.controller.js";

const router = Router();

// All market routes require authentication
router.use(authenticate);

// Get current market prices with optional filters
router.get("/prices", getCurrentPrices);

// Get price history for a crop/market
router.get("/prices/history", getPriceHistory);

// Get user's price alerts
router.get("/alerts", getPriceAlerts);

// Create a new price alert
router.post("/alerts", createPriceAlert);

// Get market insights and recommendations
router.get("/insights", getMarketInsights);

// Get recommended markets for selling
router.get("/recommendations", getRecommendedMarkets);

export default router;
