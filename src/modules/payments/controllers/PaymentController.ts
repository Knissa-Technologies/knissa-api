import { Request, Response } from "express";

import { PaymentService } from "../services/PaymentService.js";
import { paymentSchema } from "../validators/payment.schema.js";

export class PaymentController {
    async create(request: Request, response: Response) {
        const data = paymentSchema.parse(request.body);

        const paymentService = new PaymentService();

        const result = await paymentService.execute(data);

        return response.status(201).json(result);
    }
}