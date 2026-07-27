import { NextFunction, Request, Response } from "express";

import { CreateCountryService } from "../services/CreateCountryService.js";
import { DeleteCountryService } from "../services/DeleteCountryService.js";
import { GetCountriesService } from "../services/GetCountriesService.js";
import { GetCountryByIdService } from "../services/GetCountryByIdService.js";
import { UpdateCountryService } from "../services/UpdateCountryService.js";

import { createCountrySchema } from "../validators/createCountry.schema.js";
import { updateCountrySchema } from "../validators/updateCountry.schema.js";

export class CountryController {
  private readonly getCountriesService = new GetCountriesService();
  private readonly getCountryByIdService = new GetCountryByIdService();

  async index(_req: Request, res: Response, next: NextFunction) {
    try {
      const countries = await this.getCountriesService.execute();

      return res.status(200).json({
        success: true,
        data: countries,
      });
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid country id.",
        });
      }

      const country = await this.getCountryByIdService.execute(id);

      return res.status(200).json({
        success: true,
        data: country,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const service = new CreateCountryService();

      const data = createCountrySchema.parse(req.body);

      const country = await service.execute(data);

      return res.status(201).json({
        success: true,
        data: country,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid country id.",
        });
      }

      const service = new UpdateCountryService();

      const data = updateCountrySchema.parse(req.body);

      const country = await service.execute(id, data);

      return res.status(200).json({
        success: true,
        data: country,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid country id.",
        });
      }

      const service = new DeleteCountryService();

      await service.execute(id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
