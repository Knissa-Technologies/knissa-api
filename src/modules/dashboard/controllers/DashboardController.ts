import { NextFunction, Request, Response } from "express";

import { GetDashboardService } from "../services/GetDashboardService.js";

export class DashboardController {

  private readonly service = new GetDashboardService();

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await this.service.execute(req.user!.id);

      return res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

}