import { Request, Response, NextFunction } from "express";
import { onboardingService } from "../services/onboarding.service.js";
import { 
  farmerOnboardingSchema, 
  officerOnboardingSchema, 
  cooperativeOnboardingSchema 
} from "../validators/onboarding.validator.js";


export const onboardFarmer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = farmerOnboardingSchema.parse(req.body);
    const userId = (req as any).user.id;
    const profile = await onboardingService.onboardFarmer(userId, validatedData);
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const onboardOfficer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = officerOnboardingSchema.parse(req.body);
    const userId = (req as any).user.id;
    const profile = await onboardingService.onboardOfficer(userId, validatedData);
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const onboardCooperative = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = cooperativeOnboardingSchema.parse(req.body);
    const userId = (req as any).user.id;
    const profile = await onboardingService.onboardCooperative(userId, validatedData);
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
