import { Request, Response } from "express";

import { DepositService } from "../services/DepositService.js";
import { StatementService } from "../services/StatementService.js";

export class WalletController {
  async deposit(req: Request, res: Response) {
    const service = new DepositService();

    const wallet = await service.execute(req.body);

    return res.status(200).json({
      success: true,
      data: wallet,
    });
  }

  async statement(req: Request, res: Response) {
    const { accountNumber } = req.params;

    if (!accountNumber || Array.isArray(accountNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account number.",
      });
    }

    const service = new StatementService();

    const statement = await service.execute(accountNumber);

    return res.status(200).json({
      success: true,
      data: statement,
    });
  }
}