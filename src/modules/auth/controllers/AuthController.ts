import { Request, Response } from "express";

import { ApiResponse } from "../../../shared/http/ApiResponse.js";

import { AuthService } from "../services/AuthService.js";
import { registerSchema } from "../validators/register.validator.js";
import { verifyEmailSchema } from "../validators/verify-email.validator.js";

export class AuthController {
  private authService = new AuthService();

  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);

    const user = await this.authService.register(data);

    return res
      .status(201)
      .json(
        ApiResponse.success(
          user,
          "Registration successful. Please verify your email.",
        ),
      );
  }

  async verifyEmail(req: Request, res: Response) {
    const data = verifyEmailSchema.parse(req.body);

    const result = await this.authService.verifyEmail(data);

    return res.json(
      ApiResponse.success(result, "Email verified successfully."),
    );
  }
}
