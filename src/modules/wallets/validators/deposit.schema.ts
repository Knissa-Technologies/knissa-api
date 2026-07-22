import { z } from "zod";

export const depositSchema = z.object({
  accountNumber: z.string().min(1),
  amount: z.number().positive("Amount must be greater than zero"),
});