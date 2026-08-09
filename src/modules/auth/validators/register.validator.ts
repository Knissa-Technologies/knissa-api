import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address."),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters."),

    confirmPassword: z.string(),

    firstName: z
      .string()
      .trim()
      .min(2, "First name must contain at least 2 characters."),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must contain at least 2 characters."),

    countryCode: z
      .string()
      .trim()
      .toUpperCase()
      .length(2, "Country code must contain 2 characters."),

    phone: z
      .string()
      .trim()
      .min(6, "Invalid phone number."),

    languageCode: z
      .string()
      .trim()
      .toLowerCase()
      .optional(),

    referralCode: z
      .string()
      .trim()
      .optional(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }
  );

export type RegisterInput = z.infer<typeof registerSchema>;