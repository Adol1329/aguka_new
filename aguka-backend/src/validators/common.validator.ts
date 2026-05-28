import { z } from "zod";

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const DateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const IdParamSchema = z.object({
  id: z.string().uuid(),
});

export const SearchSchema = z.object({
  search: z.string().optional(),
});

export const StatusSchema = z.object({
  status: z.enum(["active", "inactive", "pending", "suspended"]).optional(),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;
export type DateRangeInput = z.infer<typeof DateRangeSchema>;
