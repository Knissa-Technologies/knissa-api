import type { Request, Response } from "express";

import { ApiResponse } from "../../../shared/http/ApiResponse.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

import type { IdParams } from "../../../shared/http/RouteParams.js";

import { AccountsService } from "../services/AccountsService.js";

export class AccountsController {
  private accountsService = new AccountsService();

  async findAll(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError(
        "User authentication required.",
      );
    }

    const accounts =
      await this.accountsService.findAll(
        req.user.id,
      );

    return res.json(
      ApiResponse.success(accounts),
    );
  }

  async findById(
    req: Request<IdParams>,
    res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedError(
        "User authentication required.",
      );
    }

    const account =
      await this.accountsService.findById(
        req.user.id,
        req.params.id,
      );

    return res.json(
      ApiResponse.success(account),
    );
  }

  async update(
    req: Request<IdParams>,
    res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedError(
        "User authentication required.",
      );
    }

    const account =
      await this.accountsService.update(
        req.user.id,
        req.params.id,
        req.body,
      );

    return res.json(
      ApiResponse.success(
        account,
        "Account updated successfully.",
      ),
    );
  }
}
