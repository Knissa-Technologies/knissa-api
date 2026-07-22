import { z } from "zod";

export const createExchangeRateSchema = z.object({
  baseCurrencyId: z.string().uuid(),
  quoteCurrencyId: z.string().uuid(),
  rate: z.number().positive(),
  source: z.string().optional(),
});