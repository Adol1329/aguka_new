import { z } from "zod";

export const createActivitySchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  activityType: z.enum(["meeting", "training", "harvest", "planting", "other"]),
  scheduledAt: z.coerce.date().refine((d) => d >= new Date(), {
    message: "Scheduled date must be in the future",
  }),
  location: z.string().max(255).optional(),
  expectedParticipants: z.number().int().min(0).optional(),
});

export const updateActivitySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  activityType: z.enum(["meeting", "training", "harvest", "planting", "other"]).optional(),
  scheduledAt: z.coerce.date().refine((d) => d >= new Date(), {
    message: "Scheduled date must be in the future",
  }).optional(),
  location: z.string().max(255).optional(),
  expectedParticipants: z.number().int().min(0).optional(),
});

export const createListingSchema = z.object({
  productName: z.string().min(1).max(255),
  cropId: z.string().uuid().optional(),
  quantity: z.coerce.number().positive(),
  unit: z.string().max(50).optional(),
  pricePerUnit: z.coerce.number().positive(),
  harvestDate: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Harvest date must be in the past",
  }).optional(),
  quality: z.string().max(100).optional(),
});

export const createDueSchema = z.object({
  userId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  period: z.string().min(1).max(50),
  dueDate: z.coerce.date().refine((d) => d >= new Date(), {
    message: "Due date must be in the future",
  }),
  notes: z.string().optional(),
});

export const updateDueSchema = z.object({
  status: z.enum(["pending", "paid", "overdue", "waived"]).optional(),
  paidAt: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Payment date must be in the past",
  }).optional(),
  notes: z.string().optional(),
});

export const createExpenseSchema = z.object({
  category: z.string().min(1).max(100),
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  expenseDate: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Expense date must be in the past",
  }),
});

export const generateReportSchema = z.object({
  title: z.string().min(1).max(255),
  reportType: z.string().min(1).max(50),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
}).refine((data) => data.periodStart <= data.periodEnd, {
  message: "Period start must be on or before period end",
  path: ["periodEnd"],
});

export const updateDistributionStatusSchema = z.object({
  status: z.string().min(1).optional(),
  returnedAt: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Return date must be in the past",
  }).optional(),
});

export const createCooperativeSchema = z.object({
  name: z.string().min(2).max(255),
  district: z.string().min(2).max(100),
  sector: z.string().min(2).max(100),
  contactPhone: z.string().min(6).max(20).optional(),
  description: z.string().max(1000).optional(),
});

export const assignManagerSchema = z.object({
  userId: z.string().uuid(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type CreateDueInput = z.infer<typeof createDueSchema>;
export type UpdateDueInput = z.infer<typeof updateDueSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type GenerateReportInput = z.infer<typeof generateReportSchema>;
