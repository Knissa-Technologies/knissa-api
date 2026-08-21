import type { Request, Response } from "express";

import type { IdParams } from "../../../shared/http/RouteParams.js";

import { ExchangeService } from "../services/ExchangeService.js";



export class ExchangeController {
  private exchangeService = new ExchangeService();

  // ======================================================
  // CREATE EXCHANGE QUOTE
  // ======================================================

  async createQuote(req: Request, res: Response) {
    const userId = req.user!.id;

    const quote = await this.exchangeService.createQuote(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Exchange quote created successfully.",
      data: quote,
    });
  }

  // ======================================================
  // ACCEPT EXCHANGE QUOTE
  // ======================================================

  async acceptQuote(req: Request<IdParams>, res: Response) {
    const userId = req.user!.id;

    const quoteId = req.params.id;

    const exchange = await this.exchangeService.acceptQuote(userId, {
      quoteId,
    });

    return res.status(200).json({
      success: true,
      message: "Exchange completed successfully.",
      data: exchange,
    });
  }

  // ======================================================
  // FIND ALL EXCHANGES
  // ======================================================

  async findAll(req: Request, res: Response) {
    const userId = req.user!.id;

    const exchanges = await this.exchangeService.findAll(userId);

    return res.json({
      success: true,
      data: exchanges,
    });
  }

  // ======================================================
  // FIND EXCHANGE BY ID
  // ======================================================

  async findById(req: Request<IdParams>, res: Response) {
    const userId = req.user!.id;

    const exchange = await this.exchangeService.findById(userId, {
      id: req.params.id,
    });

    return res.json({
      success: true,
      data: exchange,
    });
  }
}
