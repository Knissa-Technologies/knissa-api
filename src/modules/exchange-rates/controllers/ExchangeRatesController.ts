import type { Request, Response } from "express";

import { ExchangeRatesService } from "../services/ExchangeRatesService.js";

import type { CreateExchangeRateDTO } from "../dtos/CreateExchangeRateDTO.js";
import type { UpdateExchangeRateDTO } from "../dtos/UpdateExchangeRateDTO.js";

import { createExchangeRateSchema } from "../validators/create-exchange-rate.validator.js";
import { updateExchangeRateSchema } from "../validators/update-exchange-rate.validator.js";

import type { IdParams } from "../../../shared/http/RouteParams.js";

export class ExchangeRatesController {
  private exchangeRatesService = new ExchangeRatesService();

  // ======================================================
  // FIND ALL EXCHANGE RATES
  // ======================================================

  async findAll(req: Request, res: Response) {
    const exchangeRates = await this.exchangeRatesService.findAll();

    return res.status(200).json({
      success: true,
      data: exchangeRates,
    });
  }

  // ======================================================
  // FIND EXCHANGE RATE BY ID
  // ======================================================

  async findById(req: Request<IdParams>, res: Response) {
    const { id } = req.params;

    const exchangeRate = await this.exchangeRatesService.findById(id);

    return res.status(200).json({
      success: true,
      data: exchangeRate,
    });
  }

  // ======================================================
  // CREATE EXCHANGE RATE
  // ======================================================

  async create(req: Request<{}, {}, CreateExchangeRateDTO>, res: Response) {
    const data = createExchangeRateSchema.parse(req.body);

    const exchangeRate = await this.exchangeRatesService.create(data);

    return res.status(201).json({
      success: true,
      message: "Exchange rate created successfully.",
      data: exchangeRate,
    });
  }

  // ======================================================
  // UPDATE EXCHANGE RATE
  // ======================================================

  async update(
    req: Request<IdParams, {}, UpdateExchangeRateDTO>,
    res: Response,
  ) {
    const { id } = req.params;

    const data = updateExchangeRateSchema.parse(req.body);

    const exchangeRate = await this.exchangeRatesService.update(id, data);

    return res.status(200).json({
      success: true,
      message: "Exchange rate updated successfully.",
      data: exchangeRate,
    });
  }

  // ======================================================
  // EXPIRE EXCHANGE RATE
  // ======================================================

  async expire(req: Request<IdParams>, res: Response) {
    const { id } = req.params;

    const exchangeRate = await this.exchangeRatesService.expire(id);

    return res.status(200).json({
      success: true,
      message: "Exchange rate expired successfully.",
      data: exchangeRate,
    });
  }
}
