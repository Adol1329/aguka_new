import { z } from "zod";

export const createCropSchema = z.object({
  nameEn: z.string().min(1).max(100),
  nameRw: z.string().max(100).optional(),
  nameFr: z.string().max(100).optional(),
  category: z.string().min(1).max(50),
  growingPeriodDays: z.number().int().positive().optional(),
  waterRequirementMm: z.number().positive().optional(),
  nitrogenRequirementKgha: z.number().positive().optional(),
  phosphorusRequirementKgha: z.number().positive().optional(),
  potassiumRequirementKgha: z.number().positive().optional(),
  optimalPhMin: z.number().min(0).max(14).optional(),
  optimalPhMax: z.number().min(0).max(14).optional(),
  optimalTempMinCelsius: z.number().optional(),
  optimalTempMaxCelsius: z.number().optional(),
  imageUrl: z.string().url().optional(),
});

export const addFarmerCropSchema = z.object({
  cropId: z.string().uuid(),
  plantedDate: z.coerce.date(),
  expectedHarvestDate: z.coerce.date().optional(),
  plotSizeHectares: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const updateFarmerCropSchema = z.object({
  expectedHarvestDate: z.coerce.date().optional(),
  plotSizeHectares: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const harvestCropSchema = z.object({
  actualYieldKg: z.number().positive(),
  notes: z.string().optional(),
});

export type CreateCropInput = z.infer<typeof createCropSchema>;
export type AddFarmerCropInput = z.infer<typeof addFarmerCropSchema>;
export type UpdateFarmerCropInput = z.infer<typeof updateFarmerCropSchema>;
export type HarvestCropInput = z.infer<typeof harvestCropSchema>;
