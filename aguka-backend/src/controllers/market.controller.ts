import { Response, NextFunction } from "express";
import { marketService } from "../services/market.service.js";
import { AuthenticatedRequest } from "../types/index.js";

export const getCurrentPrices = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { crop, market } = req.query;
    const userId = req.user!.sub;

    const prices = await marketService.getCurrentPrices(userId, {
      crop: crop as string,
      market: market as string,
    });

    return res.json({ success: true, data: prices });
  } catch (error) {
    return next(error);
  }
};

export const getPriceHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { crop, market, days = 30 } = req.query;
    const userId = req.user!.sub;

    const history = await marketService.getPriceHistory(userId, {
      crop: crop as string,
      market: market as string,
      days: parseInt(days as string),
    });

    return res.json({ success: true, data: history });
  } catch (error) {
    return next(error);
  }
};

export const getPriceAlerts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;

    const alerts = await marketService.getPriceAlerts(userId);

    return res.json({ success: true, data: alerts });
  } catch (error) {
    return next(error);
  }
};

export const createPriceAlert = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { cropId, targetPrice, alertType, marketId } = req.body;

    const alert = await marketService.createPriceAlert(userId, {
      cropId,
      targetPrice,
      alertType,
      marketId,
    });

    return res.status(201).json({ success: true, data: alert });
  } catch (error) {
    return next(error);
  }
};

export const getMarketInsights = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;

    const insights = await marketService.getMarketInsights(userId);

    return res.json({ success: true, data: insights });
  } catch (error) {
    return next(error);
  }
};

export const getRecommendedMarkets = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { cropId, quantity } = req.query;

    const recommendations = await marketService.getRecommendedMarkets(userId, {
      cropId: cropId as string,
      quantity: quantity ? parseInt(quantity as string) : undefined,
    });

    return res.json({ success: true, data: recommendations });
  } catch (error) {
    return next(error);
  }
};
