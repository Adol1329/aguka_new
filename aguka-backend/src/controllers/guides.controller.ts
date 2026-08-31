import { Response, NextFunction } from "express";
import { prisma } from "../prisma.js";
import { RequestWithUser } from "../types/index.js";

export const getGuides = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { crop, category } = req.query;

    const where: Record<string, unknown> = { isActive: true };
    if (crop && typeof crop === "string") where.crop = crop;
    if (category && typeof category === "string") where.category = category;

    const guides = await prisma.guide.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        crop: true,
        category: true,
        summary: true,
        readingTime: true,
        waterRequirement: true,
        growthPeriod: true,
        icon: true,
        createdAt: true,
      },
    });

    return res.json({ success: true, data: guides });
  } catch (error) {
    return next(error);
  }
};

export const getGuideById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const guide = await prisma.guide.findUnique({
      where: { id },
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Guide not found" },
      });
    }

    return res.json({ success: true, data: guide });
  } catch (error) {
    return next(error);
  }
};

export const getGuideFilters = async (
  _req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [crops, categories] = await Promise.all([
      prisma.guide.findMany({
        where: { isActive: true, crop: { not: null } },
        distinct: ["crop"],
        select: { crop: true },
        orderBy: { crop: "asc" },
      }),
      prisma.guide.findMany({
        where: { isActive: true },
        distinct: ["category"],
        select: { category: true },
        orderBy: { category: "asc" },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        crops: crops.map((c) => c.crop).filter(Boolean),
        categories: categories.map((c) => c.category),
      },
    });
  } catch (error) {
    return next(error);
  }
};
