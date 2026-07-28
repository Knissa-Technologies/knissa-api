import { z } from "zod";

export const createCurrencySchema = z.object({
  code: z.string().trim().min(2).max(10),
  name: z.string().trim().min(2).max(100),
  symbol: z.string().trim().min(1).max(10),
  decimals: z.number().int().min(0).max(8).optional(),
});

export const updateCurrencySchema = createCurrencySchema.partial();