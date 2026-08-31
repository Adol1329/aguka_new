import { Request, Response, NextFunction } from "express";
import { onboardingService } from "../services/onboarding.service.js";
import {
  farmerOnboardingSchema,
  officerOnboardingSchema,
  cooperativeOnboardingSchema,
} from "../validators/onboarding.validator.js";
import { ValidationError } from "../middleware/error.middleware.js";

export const onboardFarmer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = farmerOnboardingSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError("Validation failed", validation.error.errors);
    }
    const validatedData = validation.data;
    const userId = req.userId!;
    const result = await onboardingService.onboardFarmer(
      userId,
      validatedData,
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const onboardOfficer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = officerOnboardingSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.errors);
    }
    const validatedData = result.data;
    const userId = req.userId!;
    const profile = await onboardingService.onboardOfficer(
      userId,
      validatedData,
    );
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const onboardCooperative = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = cooperativeOnboardingSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Validation failed", result.error.errors);
    }
    const validatedData = result.data;
    const userId = req.userId!;
    const profile = await onboardingService.onboardCooperative(
      userId,
      validatedData,
    );
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
