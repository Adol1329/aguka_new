import { Request, Response } from "express";
import { ExtensionOfficerService } from "../services/extension-officer.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { prisma } from "../prisma.js";

const extensionOfficerService = new ExtensionOfficerService();

/**
 * Get extension officer analysis dashboard
 */
export const getOfficerAnalysis = asyncHandler(
  async (req: Request, res: Response) => {
    const analysis = await extensionOfficerService.getOfficerAnalysis(
      req.user!.sub,
    );
    return res.json({ success: true, data: analysis });
  },
);

/**
 * Get detailed analysis for a specific farmer
 */
export const getFarmerAnalysis = asyncHandler(
  async (req: Request, res: Response) => {
    const { farmerId } = req.params;
    const analysis = await extensionOfficerService.getFarmerAnalysis(
      req.user!.sub,
      farmerId,
    );
    return res.json({ success: true, data: analysis });
  },
);

/**
 * Get performance comparison of farmers assigned to this officer
 */
export const getAssignedFarmersPerformance = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate, limit } = req.query;

    const options: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {};

    if (startDate) options.startDate = new Date(startDate as string);
    if (endDate) options.endDate = new Date(endDate as string);
    if (limit) options.limit = parseInt(limit as string, 10);

    const performanceData =
      await extensionOfficerService.getAssignedFarmersPerformance(
        req.user!.sub,
        options,
      );

    return res.json({ success: true, data: performanceData });
  },
);

/**
 * Get advisories created by this officer
 */
export const getOfficerAdvisories = asyncHandler(
  async (req: Request, res: Response) => {
    const advisories = await extensionOfficerService.getOfficerAdvisories(
      req.user!.sub,
    );
    return res.json({ success: true, data: advisories });
  },
);

/**
 * Create a new advisory
 */
export const createAdvisory = asyncHandler(
  async (req: Request, res: Response) => {
    const advisory = await extensionOfficerService.createAdvisory(
      req.user!.sub,
      req.body,
    );
    return res.status(201).json({ success: true, data: advisory });
  },
);

/**
 * Get pest/disease/climate risks tracked by this officer
 */
export const getOfficerRisks = asyncHandler(
  async (req: Request, res: Response) => {
    const risks = await extensionOfficerService.getOfficerRisks(req.user!.sub);
    return res.json({ success: true, data: risks });
  },
);

export const getAdvisoryTemplates = asyncHandler(
  async (req: Request, res: Response) => {
    const templates = await prisma.advisoryTemplate.findMany({
      where: { officerId: req.user!.sub },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: templates });
  },
);

export const createAdvisoryTemplate = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, message, recommendation, severity } = req.body;
    const template = await prisma.advisoryTemplate.create({
      data: {
        officerId: req.user!.sub,
        title,
        message,
        recommendation,
        severity: severity || "info",
      },
    });
    return res.status(201).json({ success: true, data: template });
  },
);

export const updateAdvisoryTemplate = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, message, recommendation, severity } = req.body;
    const template = await prisma.advisoryTemplate.updateMany({
      where: { id, officerId: req.user!.sub },
      data: { title, message, recommendation, severity },
    });
    if (template.count === 0)
      return res
        .status(404)
        .json({ success: false, error: { message: "Template not found" } });
    return res.json({ success: true });
  },
);

export const deleteAdvisoryTemplate = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.advisoryTemplate.deleteMany({
      where: { id, officerId: req.user!.sub },
    });
    return res.json({ success: true });
  },
);

/**
 * Get consolidated officer dashboard data
 * Returns stats, field visits, risks, and recent activities in one call
 */
export const getOfficerDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const officerId = req.user!.sub;

    const [assignments, fieldWork, risks, analysis] = await Promise.all([
      // 1. Assigned farmers
      prisma.extensionOfficerAssignment.findMany({
        where: { extensionOfficerId: officerId },
        include: {
          farmer: {
            include: {
              farmerProfile: { select: { id: true } },
            },
          },
        },
      }),
      // 2. Field visit notes
      prisma.fieldVisitNote.findMany({
        where: { officerId },
        orderBy: { visitDate: "desc" },
        include: {
          farmer: {
            select: { id: true, farmName: true, fullName: true, district: true },
          },
        },
      }),
      // 3. Active risks for assigned farmers
      (async () => {
        const profileIds = (
          await prisma.extensionOfficerAssignment.findMany({
            where: { extensionOfficerId: officerId },
            include: {
              farmer: {
                select: { farmerProfile: { select: { id: true } } },
              },
            },
          })
        )
          .map((a) => a.farmer.farmerProfile?.id)
          .filter(Boolean) as string[];

        return prisma.alert.findMany({
          where: {
            farmerId: { in: profileIds },
            alertType: { in: ["pest", "disease", "weather"] },
          },
          include: {
            farmer: {
              select: {
                id: true,
                farmName: true,
                user: { select: { fullName: true, phone: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        });
      })(),
      // 4. Extension officer analysis
      extensionOfficerService.getOfficerAnalysis(officerId),
    ]);

    const totalFarmers = assignments.length;
    const activeFarmers = analysis.activeFarmers ?? 0;
    const pendingVisits = fieldWork.filter(
      (fv) => fv.status === "pending" || fv.followUpDate != null,
    ).length;
    const activeRisks = risks.length;

    // Map field work to a cleaner format
    const fieldVisits = fieldWork.map((fv) => ({
      id: fv.id,
      farmerName: fv.farmer?.fullName ?? "Unknown",
      farmName: fv.farmer?.farmName ?? null,
      scheduledDate: fv.visitDate,
      status: fv.status ?? "pending",
      notes: fv.notes,
    }));

    // Map risks to a cleaner format
    const riskSummary = risks.map((r) => ({
      id: r.id,
      label: r.title,
      severity: r.severity ?? "warning",
      location: r.farmer?.farmName ?? r.farmer?.user?.fullName ?? null,
      description: r.message,
      detectedAt: r.createdAt,
    }));

    return res.json({
      success: true,
      data: {
        stats: {
          assignedFarmers: totalFarmers,
          farmsMonitored: activeFarmers,
          pendingVisits,
          activeRisks,
        },
        fieldVisits,
        recentActivities: analysis.recentActivities ?? [],
        risks: riskSummary,
      },
    });
  },
);

export const getAdvisoryStats = asyncHandler(
  async (req: Request, res: Response) => {
    const officerId = req.user!.sub;
    const [total, read, unread] = await Promise.all([
      prisma.alert.count({
        where: { createdById: officerId, alertType: "advisory" },
      }),
      prisma.alert.count({
        where: { createdById: officerId, alertType: "advisory", isRead: true },
      }),
      prisma.alert.count({
        where: { createdById: officerId, alertType: "advisory", isRead: false },
      }),
    ]);
    return res.json({
      success: true,
      data: {
        total,
        read,
        unread,
        readRate: total > 0 ? Math.round((read / total) * 100) : 0,
      },
    });
  },
);

export const getOfficerFieldWork = asyncHandler(
  async (req: Request, res: Response) => {
    const fieldWork = await extensionOfficerService.getOfficerFieldWork(
      req.user!.sub,
    );
    return res.json({ success: true, data: fieldWork });
  },
);

export const getFarmerNotes = asyncHandler(
  async (req: Request, res: Response) => {
    const { farmerId } = req.params;
    const officerId = req.user!.sub;
    const notes = await prisma.fieldVisitNote.findMany({
      where: { officerId, farmerId },
      orderBy: { visitDate: "desc" },
    });
    return res.json({ success: true, data: notes });
  },
);

export const createFarmerNote = asyncHandler(
  async (req: Request, res: Response) => {
    const { farmerId } = req.params;
    const { visitDate, notes, actionItems, followUpDate, status } = req.body;
    const note = await prisma.fieldVisitNote.create({
      data: {
        officerId: req.user!.sub,
        farmerId,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
        notes,
        actionItems: actionItems || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        status: status || "pending",
      },
    });
    return res.status(201).json({ success: true, data: note });
  },
);

export const updateFarmerNote = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { notes, actionItems, followUpDate, status } = req.body;
    const updated = await prisma.fieldVisitNote.updateMany({
      where: { id, officerId: req.user!.sub },
      data: {
        ...(notes !== undefined && { notes }),
        ...(actionItems !== undefined && { actionItems }),
        ...(followUpDate !== undefined && {
          followUpDate: followUpDate ? new Date(followUpDate) : null,
        }),
        ...(status !== undefined && { status }),
      },
    });
    if (updated.count === 0)
      return res
        .status(404)
        .json({ success: false, error: { message: "Note not found" } });
    return res.json({ success: true });
  },
);

export const deleteFarmerNote = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.fieldVisitNote.deleteMany({
      where: { id, officerId: req.user!.sub },
    });
    return res.json({ success: true });
  },
);
