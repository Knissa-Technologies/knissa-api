import { z } from "zod";

export const paymentSchema = z.object({
    walletId: z.string().uuid({
        message: "Invalid wallet ID.",
    }),

    amount: z
        .number({
            message: "Amount must be a number.",
        })
        .positive({
            message: "Amount must be greater than zero.",
        }),

    beneficiary: z
        .string({
            message: "Beneficiary is required.",
        })
        .min(2, {
            message: "Beneficiary must have at least 2 characters.",
        })
        .max(100, {
            message: "Beneficiary must have at most 100 characters.",
        }),

    description: z
        .string()
        .max(255, {
            message: "Description must have at most 255 characters.",
        })
        .optional(),
});