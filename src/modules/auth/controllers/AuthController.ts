import { Request, Response } from "express";

import { LoginService } from "../services/LoginService.js";
import { RegisterService } from "../services/RegisterService.js";

export class AuthController {
  async register(req: Request, res: Response) {
    const service = new RegisterService();

    const user = await service.execute(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: user,
    });
  }

  async login(req: Request, res: Response) {
    const service = new LoginService();

    const result = await service.execute(req.body);

    return res.json({
      success: true,
      data: result,
    });
  }
}