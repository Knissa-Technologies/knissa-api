import { Request, Response } from "express";

import { CreateExchangeRateService } from "../services/CreateExchangeRateService.js";
import { createExchangeRateSchema } from "../validators/createExchangeRate.schema.js";
import { GetAllExchangeRatesService } from "../services/GetAllExchangeRatesService.js";
import { GetExchangeRateByIdService } from "../services/GetExchangeRateByIdService.js";
import { UpdateExchangeRateService } from "../services/UpdateExchangeRateService.js";
import { updateExchangeRateSchema } from "../validators/updateExchangeRate.schema.js";
import { DeleteExchangeRateService } from "../services/DeleteExchangeRateService.js";

export class ExchangeRateController {


  async findAll(req: Request, res: Response) {
    try {
      const service = new GetAllExchangeRatesService();

      const exchangeRates = await service.execute();

      return res.status(200).json({
        success: true,
        data: exchangeRates,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }


  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid exchange rate id.",
        });
      }

      const service = new GetExchangeRateByIdService();

      const exchangeRate = await service.execute(id);

      return res.status(200).json({
        success: true,
        data: exchangeRate,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = createExchangeRateSchema.parse(req.body);

      const service = new CreateExchangeRateService();

      const exchangeRate = await service.execute(data);

      return res.status(201).json({
        success: true,
        message: "Exchange rate created successfully.",
        data: exchangeRate,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(
    req: Request<{ id: string }>,
    res: Response
  ) {
    try {
      const { id } = req.params;

      const data = updateExchangeRateSchema.parse(req.body);

      const service = new UpdateExchangeRateService();

      const exchangeRate = await service.execute(id, data);

      return res.status(200).json({
        success: true,
        message: "Exchange rate updated successfully.",
        data: exchangeRate,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(
    req: Request<{ id: string }>,
    res: Response
  ) {
    try {
      const { id } = req.params;

      const service = new DeleteExchangeRateService();

      await service.execute(id);

      return res.status(200).json({
        success: true,
        message: "Exchange rate deleted successfully.",
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

}