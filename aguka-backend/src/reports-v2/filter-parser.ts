import { Request } from "express";
import { ReportFilters } from "./types.js";
import { ReportError } from "./utils.js";
import { prisma } from "../prisma.js";

function parseDate(value: unknown, field: string): Date | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) {
    throw new ReportError(
      "INVALID_DATE",
      `Invalid ${field}: ${String(value)}`,
      400,
    );
  }
  return d;
}

function asString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value);
}

export async function parseReportFilters(req: Request): Promise<ReportFilters> {
  const q = req.query as Record<string, unknown>;
  let startDate = parseDate(q.startDate, "startDate");
  let endDate = parseDate(q.endDate, "endDate");

  const seasonId = asString(q.seasonId);
  let seasonName: string | undefined;

  if (seasonId) {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
    });

    if (!season) {
      throw new ReportError("NOT_FOUND", "Season not found", 404);
    }

    seasonName = season.name;

    // Calculate dates for current year based on the season if not explicitly set
    if (!startDate && !endDate) {
      const currentYear = new Date().getFullYear();
      startDate = new Date(currentYear, season.startMonth - 1, 1);
      let endYear = currentYear;
      if (season.endMonth < season.startMonth) {
        endYear += 1;
      }
      // Last day of the end month
      endDate = new Date(endYear, season.endMonth, 0, 23, 59, 59, 999);
    }
  }

  if (startDate && endDate && startDate > endDate) {
    throw new ReportError(
      "INVALID_RANGE",
      "startDate must be on or before endDate",
      400,
    );
  }

  return {
    startDate,
    endDate,
    season: seasonName,
    cropType: asString(q.cropType),
    cropId: asString(q.cropId),
    cooperativeId: asString(q.cooperativeId),
    district: asString(q.district),
    farmerId: asString(q.farmerId),
    officerId: asString(q.officerId),
    search: asString(q.search),
  };
}
