import { z } from "zod";

export const createExchangeRateSchema = z.object({
  baseCurrencyId: z
    .string()
    .uuid("Invalid base currency ID."),

  quoteCurrencyId: z
    .string()
    .uuid("Invalid quote currency ID."),

  rate: z
    .coerce
    .number()
    .positive("Exchange rate must be greater than zero."),

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

export type CreateExchangeRateInput = z.infer<
  typeof createExchangeRateSchema
>;
