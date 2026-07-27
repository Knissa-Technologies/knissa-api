import { z } from "zod";

export const updateCountrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  phoneCode: z
    .string()
    .trim()
    .optional(),

  currencyCode: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase())
    .optional(),
});