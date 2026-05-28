import { Request, Response } from "express";
import { ExtensionOfficerService } from "../services/extension-officer.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const extensionOfficerService = new ExtensionOfficerService();

/**
 * Get extension officer analysis dashboard
 */
export const getOfficerAnalysis = asyncHandler(
  async (req: Request, res: Response) => {
    const analysis = await extensionOfficerService.getOfficerAnalysis(
      req.user!.sub
    );
    return res.json({ success: true, data: analysis });
  }
);

/**
 * Get detailed analysis for a specific farmer
 */
export const getFarmerAnalysis = asyncHandler(
  async (req: Request, res: Response) => {
    const { farmerId } = req.params;
    const analysis = await extensionOfficerService.getFarmerAnalysis(
      req.user!.sub,
      farmerId
    );
    return res.json({ success: true, data: analysis });
  }
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
    
    const performanceData = await extensionOfficerService.getAssignedFarmersPerformance(
      req.user!.sub,
      options
    );
    
    return res.json({ success: true, data: performanceData });
  }
);

/**
 * Get advisories created by this officer
 */
export const getOfficerAdvisories = asyncHandler(
  async (req: Request, res: Response) => {
    const advisories = await extensionOfficerService.getOfficerAdvisories(
      req.user!.sub
    );
    return res.json({ success: true, data: advisories });
  }
);

/**
 * Create a new advisory
 */
export const createAdvisory = asyncHandler(
  async (req: Request, res: Response) => {
    const advisory = await extensionOfficerService.createAdvisory(
      req.user!.sub,
      req.body
    );
    return res.status(201).json({ success: true, data: advisory });
  }
);

/**
 * Get pest/disease/climate risks tracked by this officer
 */
export const getOfficerRisks = asyncHandler(
  async (req: Request, res: Response) => {
    const risks = await extensionOfficerService.getOfficerRisks(
      req.user!.sub
    );
    return res.json({ success: true, data: risks });
  }
);