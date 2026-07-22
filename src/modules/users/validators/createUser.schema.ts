import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  countryId: z.uuid(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;