import { Response, NextFunction } from "express";
import { reportService } from "../services/report.service.js";
import { RequestWithUser } from "../types/index.js";
import { prisma } from "../prisma.js";
import {
  ValidationError,
  ForbiddenError,
} from "../middleware/error.middleware.js";

async function getFarmerId(req: RequestWithUser): Promise<string> {
  const queryFarmerId = req.query.farmerId as string;
  const userId = req.user!.sub;
  const userRole = req.user!.role;

  // 1. If farmerId is provided in query (standard for admin/officer views)
  if (queryFarmerId) {
    const profile = await prisma.farmerProfile.findUnique({
      where: { id: queryFarmerId },
    });

    if (!profile) {
      throw new Error("Farmer profile not found");
    }

    // Authorization check for non-admin roles
    if (userRole === "farmer" && profile.userId !== userId) {
      throw new ForbiddenError("Unauthorized access to this report");
    }

    // For officers, we should ideally check assignments here too,
    // but for now we prioritize fixing the 500 crash.

    return profile.id;
  }

  // 2. Fallback: try to find the farmer profile for the logged-in user (for farmers)
  const profile = await prisma.farmerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    if (
      userRole === "admin" ||
      userRole === "super_admin" ||
      userRole === "officer"
    ) {
      throw new ValidationError(
        "Please provide a farmerId query parameter to generate a report.",
      );
    }
    throw new ValidationError("Farmer profile not found");
  }

  return profile.id;
}

export const generateSoilReport = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = await getFarmerId(req);
    const { start, end } = req.query;

    const dateRange =
      start && end
        ? {
            start: new Date(start as string),
            end: new Date(end as string),
          }
        : undefined;

    const pdf = await reportService.generateSoilReport(farmerId, dateRange);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=soil-report.pdf",
    );
    return res.send(pdf);
  } catch (error) {
    return next(error);
  }
};

export const generateIrrigationReport = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = await getFarmerId(req);
    const pdf = await reportService.generateIrrigationReport(farmerId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=irrigation-report.pdf",
    );
    return res.send(pdf);
  } catch (error) {
    return next(error);
  }
};

export const generateCropReport = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = await getFarmerId(req);
    const pdf = await reportService.generateCropReport(farmerId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=crop-report.pdf",
    );
    return res.send(pdf);
  } catch (error) {
    return next(error);
  }
};

export const generatePerformanceReport = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = await getFarmerId(req);
    const pdf = await reportService.generatePerformanceReport(farmerId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=aguka-performance-report-${new Date().getFullYear()}.pdf`,
    );
    return res.send(pdf);
  } catch (error) {
    return next(error);
  }
};

export const generateAllReports = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = await getFarmerId(req);

    const soilPdf = await reportService.generateSoilReport(farmerId);
    const irrigationPdf =
      await reportService.generateIrrigationReport(farmerId);
    const cropPdf = await reportService.generateCropReport(farmerId);

    return res.json({
      soil: soilPdf.toString("base64"),
      irrigation: irrigationPdf.toString("base64"),
      crops: cropPdf.toString("base64"),
    });
  } catch (error) {
    return next(error);
  }
};
export const signCertificate = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = req.params.farmerId;
    const officerId = req.user!.sub;

    const pdf = await reportService.signAndIssuePerformanceCertificate(
      farmerId,
      officerId,
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=aguka-certificate-${farmerId.substring(0, 8)}.pdf`,
    );
    return res.send(pdf);
  } catch (error) {
    return next(error);
  }
};
export const getAnalytics = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmerId = await getFarmerId(req);
    const analytics = await reportService.getFarmerAnalytics(farmerId);
    return res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return next(error);
  }
};

export const generateFinancialReport = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { startDate, endDate, cooperativeId } = req.body;

    if (!startDate || !endDate) {
      throw new ValidationError("startDate and endDate are required");
    }

    const result = await reportService.generateFinancialReport(
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        cooperativeId,
      },
      req.user!.sub,
    );

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const listFinancialReports = async (
  _req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reports = await reportService.listFinancialReports();
    return res.json({ success: true, data: reports });
  } catch (error) {
    return next(error);
  }
};

export const exportFinancialReport = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const format = req.query.format === "csv" ? "csv" : "pdf";
    const exportResult = await reportService.exportFinancialReport(
      req.params.id,
      format,
    );

    res.setHeader("Content-Type", exportResult.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${exportResult.filename}`,
    );
    return res.send(exportResult.buffer);
  } catch (error) {
    return next(error);
  }
};
