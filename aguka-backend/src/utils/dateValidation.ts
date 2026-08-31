import { z } from "zod";

export const pastDate = z.coerce.date().refine((d) => d <= new Date(), {
  message: "Date must be in the past",
});
export const futureDate = z.coerce.date().refine((d) => d >= new Date(), {
  message: "Date must be in the future",
});
export const optionalPastDate = pastDate.optional();
export const optionalFutureDate = futureDate.optional();
