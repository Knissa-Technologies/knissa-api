import { Request, Response } from "express";

import { ExchangeService } from "../services/ExchangeService.js";
import { exchangeSchema } from "../validators/exchange.schema.js";

export class ExchangeController {
    async create(req: Request, res: Response) {
        const data = exchangeSchema.parse(req.body);

        const service = new ExchangeService();

        const result = await service.execute(data);

        return res.status(201).json(result);
    }
}