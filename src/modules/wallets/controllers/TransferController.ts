import { Request, Response } from "express";

import { TransferService } from "../services/TransferService.js";
import { transferSchema } from "../validators/transfer.schema.js";

export class TransferController {
  async handle(req: Request, res: Response) {
    const data = transferSchema.parse(req.body);

    const service = new TransferService();

    const result = await service.execute(data);

    return res.status(200).json(result);
  }
}