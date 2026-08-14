import { z } from "zod";

export const mfaVerifyLoginSchema = z.object({
  challengeToken: z
    .string()
    .min(1, "MFA challenge token is required."),

  code: z
    .string()
    .regex(/^\d{6}$/, "MFA code must contain exactly 6 digits."),
});

export type MfaVerifyLoginInput = z.infer<
  typeof mfaVerifyLoginSchema
>;