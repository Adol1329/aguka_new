import { Response, NextFunction } from "express";
import { prisma } from "../prisma.js";
import { RequestWithUser } from "../types/index.js";

export const getSeasons = async (
  _req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seasons = await prisma.season.findMany({
      where: { isActive: true },
      orderBy: { startMonth: "asc" },
      select: {
        id: true,
        name: true,
        startMonth: true,
        endMonth: true,
        description: true,
      },
    });

    const formattedSeasons = seasons.map((s) => {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const start = monthNames[s.startMonth - 1];
      const end = monthNames[s.endMonth - 1];
      return {
        id: s.id,
        name: s.name,
        period: `${start}–${end}`,
      };
    });

    return res.json({ success: true, data: formattedSeasons });
  } catch (error) {
    return next(error);
  }
};
