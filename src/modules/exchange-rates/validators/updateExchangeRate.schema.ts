import { z } from "zod";

export const updateExchangeRateSchema = z.object({
  rate: z.number().positive().optional(),
  source: z.string().optional(),
});