import { z } from "zod";

export const createCountrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Country name must have at least 2 characters.")
    .max(100),

  isoCode: z
    .string()
    .trim()
    .length(2, "ISO code must contain exactly 2 characters.")
    .transform((value) => value.toUpperCase()),

  phoneCode: z
    .string()
    .trim()
    .optional(),

  currencyCode: z
    .string()
    .trim()
    .length(3, "Currency code must contain exactly 3 characters.")
    .transform((value) => value.toUpperCase())
    .optional(),
});