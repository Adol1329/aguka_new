import { z } from "zod";

export const createNoteSchema = z.object({
  visitDate: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Visit date must be in the past",
  }).optional(),
  notes: z.string().min(1),
  actionItems: z.string().optional(),
  followUpDate: z.coerce.date().refine((d) => d >= new Date(), {
    message: "Follow-up date must be in the future",
  }).optional(),
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
});

export const updateNoteSchema = z.object({
  notes: z.string().min(1).optional(),
  actionItems: z.string().optional(),
  followUpDate: z.coerce.date().refine((d) => d >= new Date(), {
    message: "Follow-up date must be in the future",
  }).optional().nullable(),
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
});
