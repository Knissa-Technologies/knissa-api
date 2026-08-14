import { z } from "zod";

export const mfaVerifySchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, "MFA code must contain exactly 6 digits."),
});

export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>;