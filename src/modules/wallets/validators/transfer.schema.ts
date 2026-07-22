import { z } from "zod";

export const transferSchema = z.object({
  fromAccount: z.string().min(1, "Origin account is required."),
  toAccount: z.string().min(1, "Destination account is required."),
  amount: z.number().positive("Amount must be greater than zero."),
});