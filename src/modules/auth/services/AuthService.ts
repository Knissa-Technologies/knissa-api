import argon2 from "argon2";

import { AuthRepository } from "../repositories/AuthRepository.js";

import { RegisterDTO } from "../dto/RegisterDTO.js";
import { LoginDTO } from "../dto/LoginDTO.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getExpirationDate,
} from "../utils/jwt.js";

import { OpenAccountService } from "../../wallets/services/OpenAccountService.js";

import {
  AppError,
} from "../../../shared/errors/AppError.js";

export class AuthService {
  private readonly repository = new AuthRepository();

  private readonly openAccountService = new OpenAccountService();

  // =====================================================
  // REGISTER
  // =====================================================

  async register(data: RegisterDTO) {
    const userExists = await this.repository.findByEmail(data.email);

    if (userExists) {
      throw new AppError("Email already registered.", 409);
    }

    const passwordHash = await argon2.hash(data.password);

    const user = await this.repository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      phone: data.phone,
      countryId: data.countryId,
    });

    // Open the first wallet automatically
    await this.openAccountService.execute(
      user.id,
      data.countryId,
    );

    return this.createSession(user.id, user.role);
  }

  // =====================================================
  // LOGIN
  // =====================================================

  async login(data: LoginDTO) {
    const user = await this.repository.findByEmail(data.email);

    if (!user) {
      throw new AppError("Invalid credentials.", 401);
    }

    const passwordIsValid = await argon2.verify(
      user.passwordHash,
      data.password,
    );

    if (!passwordIsValid) {
      throw new AppError("Invalid credentials.", 401);
    }

    return this.createSession(user.id, user.role);
  }

  // =====================================================
  // REFRESH
  // =====================================================

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    const storedToken =
      await this.repository.findRefreshTokenByJti(payload.jti);

    if (!storedToken) {
      throw new AppError("Refresh token not found.", 401);
    }

    if (storedToken.revokedAt) {
      throw new AppError("Refresh token revoked.", 401);
    }

    if (storedToken.expiresAt < new Date()) {
      throw new AppError("Refresh token expired.", 401);
    }

    const validToken = await argon2.verify(
      storedToken.tokenHash,
      refreshToken,
    );

    if (!validToken) {
      throw new AppError("Invalid refresh token.", 401);
    }

    await this.repository.revokeRefreshToken(storedToken.id);

    return this.createSession(
      storedToken.user.id,
      storedToken.user.role,
    );
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async logout(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    const storedToken =
      await this.repository.findRefreshTokenByJti(payload.jti);

    if (!storedToken) {
      return;
    }

    await this.repository.revokeRefreshToken(storedToken.id);
  }

  // =====================================================
  // LOGOUT ALL
  // =====================================================

  async logoutAll(userId: string) {
    await this.repository.revokeAllUserTokens(userId);
  }

  // =====================================================
  // CREATE SESSION
  // =====================================================

  private async createSession(
    userId: string,
    role: string,
  ) {
    const accessToken = generateAccessToken(
      userId,
      role,
    );

    const {
      token: refreshToken,
      jti,
    } = generateRefreshToken(userId);

    const tokenHash = await argon2.hash(refreshToken);

    await this.repository.createRefreshToken({
      userId,
      jti,
      tokenHash,
      expiresAt: getExpirationDate(refreshToken),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}