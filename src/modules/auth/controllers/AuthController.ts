import { Request, Response } from "express";

import { ApiResponse } from "../../../shared/http/ApiResponse.js";

import { AuthService } from "../services/AuthService.js";

import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

import { loginSchema } from "../validators/login.validator.js";
import { registerSchema } from "../validators/register.validator.js";
import { verifyEmailSchema } from "../validators/verify-email.validator.js";
import { refreshTokenSchema } from "../validators/refresh-token.validator.js";

export class AuthController {
  private authService = new AuthService();

  // ======================================================
  // REGISTER
  // ======================================================

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

  // ======================================================
  // LOGIN
  // ======================================================

  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);

    const result = await this.authService.login(data);

    return res.json(ApiResponse.success(result, "Login successful."));
  }

  // ======================================================
  // LOGOUT
  // ======================================================

  async logout(req: Request, res: Response) {
    if (!req.sessionId) {
      throw new UnauthorizedError("Session not found.");
    }

    const result = await this.authService.logout(req.sessionId);

    return res.json(ApiResponse.success(result, "Logout successful."));
  }

  // ======================================================
  // GET ACTIVE SESSIONS
  // ======================================================

  async getSessions(req: Request, res: Response) {
    if (!req.user?.id) {
      throw new UnauthorizedError("User not authenticated.");
    }

    const sessions = await this.authService.getSessions(req.user.id);

    return res.json(
      ApiResponse.success(sessions, "Active sessions retrieved successfully."),
    );
  }

  // ======================================================
  // REVOKE SESSION
  // ======================================================

  async revokeSession(req: Request, res: Response) {
    if (!req.user?.id) {
      throw new UnauthorizedError("User not authenticated.");
    }

    const sessionId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const result = await this.authService.revokeSession(req.user.id, sessionId);

    return res.json(
      ApiResponse.success(result, "Session revoked successfully."),
    );
  }

  // ======================================================
  // VERIFY EMAIL
  // ======================================================

  async verifyEmail(req: Request, res: Response) {
    const data = verifyEmailSchema.parse(req.body);

    const result = await this.authService.verifyEmail(data);

    return res.json(
      ApiResponse.success(result, "Email verified successfully."),
    );
  }

  async refresh(req: Request, res: Response) {
    const data = refreshTokenSchema.parse(req.body);

    const result = await this.authService.refresh(data);

    return res.json(
      ApiResponse.success(result, "Token refreshed successfully."),
    );
  }
}
