import { z } from "zod";

export const openAccountSchema = z.object({
  userId: z.uuid("Invalid user id."),
  countryId: z.uuid("Invalid country id."),
});