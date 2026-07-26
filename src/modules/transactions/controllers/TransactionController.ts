import { NextFunction, Request, Response } from "express";

import { GetTransactionsService } from "../services/GetTransactionsService.js";
import { GetTransactionByReferenceService } from "../services/GetTransactionByReferenceService.js";

export class TransactionController {
  private readonly getTransactionsService = new GetTransactionsService();

  private readonly getTransactionByReferenceService =
    new GetTransactionByReferenceService();

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const transactions = await this.getTransactionsService.execute(
        req.user!.id,
      );

      return res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  async show(
    req: Request<{ reference: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const transaction = await this.getTransactionByReferenceService.execute(
        req.params.reference,
      );

      return res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
}
