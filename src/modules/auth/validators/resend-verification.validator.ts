import { z } from "zod";

export const resendVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .email("A valid email address is required."),
});