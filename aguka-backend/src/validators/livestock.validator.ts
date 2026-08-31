import { z } from "zod";

export const addLivestockSchema = z.object({
  animalType: z.string().min(1).max(100),
  breed: z.string().max(100).optional(),
  tagNumber: z.string().max(100).optional(),
  birthDate: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Birth date must be in the past",
  }).optional(),
  purchaseDate: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Purchase date must be in the past",
  }).optional(),
  weightKg: z.number().positive().optional(),
  healthStatus: z.string().max(50).optional(),
  feedingRegime: z.string().optional(),
  notes: z.string().optional(),
});

export const updateLivestockSchema = z.object({
  animalType: z.string().min(1).max(100).optional(),
  breed: z.string().max(100).optional(),
  tagNumber: z.string().max(100).optional(),
  birthDate: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Birth date must be in the past",
  }).optional(),
  purchaseDate: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Purchase date must be in the past",
  }).optional(),
  weightKg: z.number().positive().optional(),
  healthStatus: z.string().max(50).optional(),
  feedingRegime: z.string().optional(),
  notes: z.string().optional(),
});

export type AddLivestockInput = z.infer<typeof addLivestockSchema>;
export type UpdateLivestockInput = z.infer<typeof updateLivestockSchema>;
