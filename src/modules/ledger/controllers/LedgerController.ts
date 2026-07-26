import { NextFunction, Request, Response } from "express";

import { GetLedgerService } from "../services/GetLedgerService.js";
import { GetWalletLedgerService } from "../services/GetWalletLedgerService.js";

export class LedgerController {
  private readonly getLedgerService = new GetLedgerService();

  private readonly getWalletLedgerService =
    new GetWalletLedgerService();

  async index(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const entries = await this.getLedgerService.execute(
        req.user!.id,
      );

      return res.status(200).json({
        success: true,
        data: entries,
      });
    } catch (error) {
      next(error);
    }
  }

  async show(
    req: Request<{ walletId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const entries =
        await this.getWalletLedgerService.execute(
          req.params.walletId,
        );

      return res.status(200).json({
        success: true,
        data: entries,
      });
    } catch (error) {
      next(error);
    }
  }
}