import type { Request, Response } from "express";

import { ApiResponse } from "../../../shared/http/ApiResponse.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

import type { IdParams } from "../../../shared/http/RouteParams.js";

import type { CreateDepositDTO } from "../dtos/CreateDepositDTO.js";
import type { CreateTransferDTO } from "../dtos/CreateTransferDTO.js";
import type { FindTransactionsQueryDTO } from "../dtos/FindTransactionsQueryDTO.js";

import { TransactionsService } from "../services/TransactionsService.js";

export class TransactionsController {
  private transactionsService = new TransactionsService();

  // ======================================================
  // FIND ALL TRANSACTIONS
  // ======================================================

  async findAll(
    req: Request<{}, {}, {}, FindTransactionsQueryDTO>,
    res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedError(
        "User authentication required.",
      );
    }

    const result =
      await this.transactionsService.findAll(
        req.user.id,
        req.query,
      );

    return res.json(
      ApiResponse.success(result),
    );
  }

  // ======================================================
  // FIND TRANSACTION BY ID
  // ======================================================

  async findById(
    req: Request<IdParams>,
    res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedError(
        "User authentication required.",
      );
    }

    const transaction =
      await this.transactionsService.findById(
        req.user.id,
        req.params.id,
      );

    return res.json(
      ApiResponse.success(transaction),
    );
  }

  // ======================================================
  // TRANSFER
  // ======================================================

  async transfer(
    req: Request,
    res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedError(
        "User authentication required.",
      );
    }

    const transaction =
      await this.transactionsService.transfer(
        req.user.id,
        req.body as CreateTransferDTO,
      );

    return res
      .status(201)
      .json(
        ApiResponse.success(
          transaction,
          "Transfer completed successfully.",
        ),
      );
  }

  // ======================================================
  // TEST DEPOSIT
  // ======================================================

  async deposit(
    req: Request,
    res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedError(
        "User authentication required.",
      );
    }

    const transaction =
      await this.transactionsService.deposit(
        req.user.id,
        req.body as CreateDepositDTO,
      );

    return res
      .status(201)
      .json(
        ApiResponse.success(
          transaction,
          "Test deposit completed successfully.",
        ),
      );
  }
}