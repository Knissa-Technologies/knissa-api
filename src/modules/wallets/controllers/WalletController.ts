import { NextFunction, Request, Response } from "express";
import { GetWalletsService } from "../services/GetWalletsService.js";

import { DepositService } from "../services/DepositService.js";
import { StatementService } from "../services/StatementService.js";
import { OpenAccountService } from "../services/OpenAccountService.js";
import { openAccountSchema } from "../validators/openAccount.schema.js";

import { WithdrawService } from "../services/WithdrawService.js";
import { withdrawSchema } from "../validators/withdraw.schema.js";

export class WalletController {
  async deposit(req: Request, res: Response) {
    const service = new DepositService();

    const wallet = await service.execute(req.body);

    return res.status(200).json({
      success: true,
      data: wallet,
    });
  }

  private readonly getWalletsService = new GetWalletsService();

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const wallets = await this.getWalletsService.execute(req.user!.id);

      return res.status(200).json({
        success: true,
        data: wallets,
      });
    } catch (error) {
      next(error);
    }
  }

  async openAccount(req: Request, res: Response) {
    const data = openAccountSchema.parse(req.body);

    const service = new OpenAccountService();

    const wallet = await service.execute(data.userId, data.countryId);

    return res.status(201).json({
      success: true,
      data: wallet,
    });
  }

  async withdraw(req: Request, res: Response) {
    const data = withdrawSchema.parse(req.body);

    const service = new WithdrawService();

    const result = await service.execute(data);

    return res.status(200).json(result);
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
