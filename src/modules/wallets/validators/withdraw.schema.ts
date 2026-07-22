import { z } from "zod";

export const withdrawSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required."),
  amount: z.number().positive("Amount must be greater than zero."),
});