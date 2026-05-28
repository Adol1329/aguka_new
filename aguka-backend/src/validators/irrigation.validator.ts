import { z } from "zod";

export const createIrrigationScheduleSchema = z.object({
  cropId: z.string().uuid().optional(),
  scheduleType: z.enum(["automatic", "manual", "weather_based"]),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  durationMinutes: z.number().int().positive().optional(),
  frequency: z.enum(["daily", "every_2_days", "weekly", "custom"]),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  waterSource: z
    .enum(["rainwater", "well", "river", "municipal", "other"])
    .optional(),
  waterAmountLiters: z.number().positive().optional(),
  pumpEnabled: z.boolean().default(false),
  valveEnabled: z.boolean().default(false),
});

export const updateIrrigationScheduleSchema = z.object({
  cropId: z.string().uuid().optional(),
  scheduleType: z.enum(["automatic", "manual", "weather_based"]).optional(),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  durationMinutes: z.number().int().positive().optional(),
  frequency: z.enum(["daily", "every_2_days", "weekly", "custom"]).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  waterSource: z
    .enum(["rainwater", "well", "river", "municipal", "other"])
    .optional(),
  waterAmountLiters: z.number().positive().optional(),
  pumpEnabled: z.boolean().optional(),
  valveEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const triggerIrrigationSchema = z.object({
  scheduleId: z.string().uuid().optional(),
  durationMinutes: z.number().int().positive().optional(),
});

export type CreateIrrigationScheduleInput = z.infer<
  typeof createIrrigationScheduleSchema
>;
export type UpdateIrrigationScheduleInput = z.infer<
  typeof updateIrrigationScheduleSchema
>;
export type TriggerIrrigationInput = z.infer<typeof triggerIrrigationSchema>;
