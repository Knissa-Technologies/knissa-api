import type { Request, Response } from "express";

import { ApiResponse } from "../../../shared/http/ApiResponse.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

import type { IdParams } from "../../../shared/http/RouteParams.js";

import { WalletsService } from "../services/WalletsService.js";

export class WalletsController {
  private walletsService = new WalletsService();

  async findAll(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError(
        "User authentication required.",
      );
    }

    const wallets =
      await this.walletsService.findAll(
        req.user.id,
      );

    return res.json(
      ApiResponse.success(wallets),
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

    const wallet =
      await this.walletsService.findById(
        req.user.id,
        req.params.id,
      );

    return res.json(
      ApiResponse.success(wallet),
    );
  }
}
