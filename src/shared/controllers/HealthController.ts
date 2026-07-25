import { Request, Response } from "express";
import { HealthService } from "../services/HealthService.js";

export class HealthController {
  async handle(_req: Request, res: Response) {
    const service = new HealthService();

    const health = await service.check();

    return res
      .status(health.status === "ok" ? 200 : 503)
      .json(health);
  }
}