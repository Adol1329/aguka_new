import { Response, NextFunction } from "express";
import { weatherService } from "../services/weather.service.js";
import { RequestWithUser } from "../types/index.js";

export const getCurrentWeather = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const weather = await weatherService.getCurrentWeather(farmerId);
    return res.json({ success: true, data: weather });
  } catch (error) {
    return next(error);
  }
};

export const getForecast = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.user!.sub;
    const forecast = await weatherService.getForecast(farmerId);
    return res.json({ success: true, data: forecast });
  } catch (error) {
    return next(error);
  }
};
