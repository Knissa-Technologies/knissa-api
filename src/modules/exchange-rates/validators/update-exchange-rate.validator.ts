import { z } from "zod";

export const updateExchangeRateSchema = z.object({
  rate: z
    .coerce
    .number()
    .positive("Exchange rate must be greater than zero.")
    .optional(),

  provider: z
    .enum([
      "INTERNAL",
      "MANUAL",
      "ECB",
      "FIXER",
      "OPEN_EXCHANGE",
      "CUSTOM",
    ])
    .optional(),

  validFrom: z
    .coerce
    .date()
    .optional(),

  validUntil: z
    .coerce
    .date()
    .nullable()
    .optional(),
});

export type UpdateExchangeRateInput = z.infer<
  typeof updateExchangeRateSchema
>;
