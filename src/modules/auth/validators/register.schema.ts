import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2).max(100),

  lastName: z.string().min(2).max(100),

  email: z.email(),

  password: z.string().min(8),

  phone: z.string().optional(),

  countryId: z.uuid(),
});