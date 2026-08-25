import { Request, Response } from "express";

import { ApiResponse } from "../../../shared/http/ApiResponse.js";

import { AuthService } from "../services/AuthService.js";

import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

import { resendVerificationSchema } from "../validators/resend-verification.validator.js";

import { loginSchema } from "../validators/login.validator.js";
import { registerSchema } from "../validators/register.validator.js";
import { verifyEmailSchema } from "../validators/verify-email.validator.js";
import { refreshTokenSchema } from "../validators/refresh-token.validator.js";
import { MfaService } from "../services/MfaService.js";
import { mfaVerifySchema } from "../validators/mfa-verify.validator.js";

import { mfaVerifyLoginSchema } from "../validators/mfa-verify-login.validator.js";

export class AuthController {
  private authService = new AuthService();
  private mfaService = new MfaService();

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

  async changePassword(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError("User authentication is required.");
    }

    const { currentPassword, newPassword } = req.body;

    const result = await this.authService.changePassword(
      req.user.id,
      currentPassword,
      newPassword,
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
      data: result,
    });
  }

  // ======================================================
  // MFA ENROLLMENT
  // ======================================================

  async enrollMfa(req: Request, res: Response) {
    if (!req.user?.id) {
      throw new UnauthorizedError("User not authenticated.");
    }

    const result = await this.mfaService.enroll(req.user.id);

    return res.json(
      ApiResponse.success(result, "MFA enrollment initialized successfully."),
    );
  }

  // ======================================================
  // MFA VERIFY
  // ======================================================

  async verifyMfa(req: Request, res: Response) {
    if (!req.user?.id) {
      throw new UnauthorizedError("User not authenticated.");
    }

    const data = mfaVerifySchema.parse(req.body);

    const result = await this.mfaService.verifyCode(req.user.id, data.code);

    return res.json(ApiResponse.success(result, "MFA enabled successfully."));
  }

  // ======================================================
  // MFA LOGIN VERIFY
  // ======================================================

  async verifyMfaLogin(req: Request, res: Response) {
    const data = mfaVerifyLoginSchema.parse(req.body);

    const result = await this.authService.verifyMfaLogin(
      data.challengeToken,
      data.code,
    );

    return res.json(
      ApiResponse.success(
        result,
        "MFA verification successful. Login completed.",
      ),
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

  // ======================================================
  // RESEND EMAIL VERIFICATION
  // ======================================================

  async resendEmailVerification(req: Request, res: Response) {
    const data = resendVerificationSchema.parse(req.body);

    const result = await this.authService.resendEmailVerification(data.email);

    return res.json(
      ApiResponse.success(
        result,
        "A new verification token has been generated.",
      ),
    );
  }
}
