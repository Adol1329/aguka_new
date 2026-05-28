import { Response, NextFunction } from "express";
import { prisma } from "../prisma.js";
import { alertService } from "../services/alert.service.js";
import { RequestWithUser } from "../types/index.js";
import { AlertSeverity } from "@prisma/client";

export const getOfficerAdvisories = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const advisories = await prisma.alert.findMany({
      where: {
        createdById: req.user!.sub,
        alertType: "advisory" as any,
      } as any,
      include: {
        farmer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: advisories });
  } catch (error) {
    return next(error);
  }
};

export const createAdvisory = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, message, severity, farmerIds } = req.body;

    // If farmerIds is empty, we might want to send to all assigned farmers
    let targetFarmerIds = farmerIds;
    if (!targetFarmerIds || targetFarmerIds.length === 0) {
      const assignments = await prisma.extensionOfficerAssignment.findMany({
        where: { extensionOfficerId: req.user!.sub },
        select: { farmerId: true },
      });
      targetFarmerIds = assignments.map((a) => a.farmerId);
    }

    // Resolve FarmerProfile IDs from User IDs
    const profiles = await prisma.farmerProfile.findMany({
      where: { userId: { in: targetFarmerIds } },
      select: { id: true, userId: true },
    });

    const createdAlerts = await Promise.all(
      profiles.map((profile) =>
        alertService.sendAlert({
          farmerId: profile.id, // Use FarmerProfile.id
          alertType: "advisory" as any,
          severity: (severity || "info") as AlertSeverity,
          title,
          message,
          createdById: req.user!.sub,
        } as any),
      ),
    );

    return res.status(201).json({ success: true, count: createdAlerts.length });
  } catch (error) {
    return next(error);
  }
};

export const getOfficerRisks = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get all risk alerts for farmers assigned to this officer
    const assignments = await prisma.extensionOfficerAssignment.findMany({
      where: { extensionOfficerId: req.user!.sub },
      select: { farmerId: true },
    });
    const farmerIds = assignments.map((a) => a.farmerId);

    // Resolve FarmerProfile IDs from User IDs
    const profiles = await prisma.farmerProfile.findMany({
      where: { userId: { in: farmerIds } },
      select: { id: true },
    });
    const profileIds = profiles.map((p) => p.id);

    const risks = await prisma.alert.findMany({
      where: {
        farmerId: { in: profileIds },
        alertType: { in: ["soil", "weather", "pest", "disease"] },
      },
      include: {
        farmer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: risks });
  } catch (error) {
    return next(error);
  }
};
