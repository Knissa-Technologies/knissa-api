import { Request, Response } from "express";

import { CreateCurrencyService } from "../services/CreateCurrencyService.js";
import { DeleteCurrencyService } from "../services/DeleteCurrencyService.js";
import { GetCurrenciesService } from "../services/GetCurrenciesService.js";
import { GetCurrencyService } from "../services/GetCurrencyByCodeService.js";
import { UpdateCurrencyService } from "../services/UpdateCurrencyService.js";

export class CurrencyController {
  async index(req: Request, res: Response) {
    const service = new GetCurrenciesService();

    const currencies = await service.execute();

    return res.json(currencies);
  }

  async show(req: Request, res: Response) {
    const code = String(req.params.code);

    const service = new GetCurrencyService();

    const currency = await service.execute(code);

    return res.json(currency);
  }

  async create(req: Request, res: Response) {
    const service = new CreateCurrencyService();

    const currency = await service.execute(req.body);

    return res.status(201).json(currency);
  }

  async update(req: Request, res: Response) {
    const id = String(req.params.id);

    const service = new UpdateCurrencyService();

    const currency = await service.execute(id, req.body);

    return res.json(currency);
  }

  async delete(req: Request, res: Response) {
    const id = String(req.params.id);

    const service = new DeleteCurrencyService();

    await service.execute(id);

    return res.status(204).send();
  }
}