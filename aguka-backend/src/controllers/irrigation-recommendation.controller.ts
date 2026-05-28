import { Response, NextFunction } from "express";
import { irrigationRecommendationService } from "../services/irrigation-recommendation.service.js";
import { RequestWithUser } from "../types/index.js";

export const getRecommendations = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const recommendation = await irrigationRecommendationService.generateRecommendations(farmerId);
    return res.json({ success: true, data: recommendation });
  } catch (error) {
    return next(error);
  }
};

export const acceptRecommendation = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const result = await irrigationRecommendationService.acceptRecommendation(
      farmerId,
      req.body
    );
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export default {
  getRecommendations,
  acceptRecommendation,
};