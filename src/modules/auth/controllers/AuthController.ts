import { Request, Response, NextFunction } from "express";

import { AuthService } from "../services/AuthService.js";

export class AuthController {
  private readonly service = new AuthService();

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.register(req.body);

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.login(req.body);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      const result = await this.service.refresh(refreshToken);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      await this.service.logout(refreshToken);

      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.logoutAll(req.user!.id);

      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}
