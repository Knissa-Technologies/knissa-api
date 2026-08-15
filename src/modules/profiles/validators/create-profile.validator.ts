import { z } from "zod";

export const createProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must contain at least 2 characters.")
    .max(150),

  legalName: z
    .string()
    .trim()
    .min(2, "Legal name must contain at least 2 characters.")
    .max(150),

  firstName: z
    .string()
    .trim()
    .min(2, "First name must contain at least 2 characters.")
    .max(100),

  middleName: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .optional(),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must contain at least 2 characters.")
    .max(100),

  birthDate: z
    .coerce
    .date()
    .nullable()
    .optional(),

  phoneCountryCode: z
    .string()
    .trim()
    .max(10)
    .nullable()
    .optional(),

  phoneNumber: z
    .string()
    .trim()
    .max(30)
    .nullable()
    .optional(),

  avatarUrl: z
    .string()
    .trim()
    .url()
    .max(500)
    .nullable()
    .optional(),

  languageCode: z
    .string()
    .trim()
    .max(10)
    .nullable()
    .optional(),

  languageId: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  timezoneId: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;