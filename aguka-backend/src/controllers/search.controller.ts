import { Response, NextFunction } from "express";
import { searchService } from "../services/search.service.js";
import { RequestWithUser } from "../types/index.js";

export const globalSearch = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.json({ success: true, data: {} });
    }

    const results = await searchService.globalSearch(
      q,
      req.user!.sub,
      req.user!.role as any,
    );

    return res.json({ success: true, data: results });
  } catch (error) {
    return next(error);
  }
};
