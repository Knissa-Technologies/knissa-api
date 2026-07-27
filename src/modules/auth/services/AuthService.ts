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

import {
  ConflictError,
  UnauthorizedError,
} from "../../../shared/errors/index.js";

import { OpenAccountService } from "../../wallets/services/OpenAccountService.js";

export class AuthService {
  private readonly repository = new AuthRepository();

  private readonly openAccountService = new OpenAccountService();

  // =====================================================
  // REGISTER
  // =====================================================

  async register(data: RegisterDTO) {
    const userExists = await this.repository.findByEmail(data.email);

    if (userExists) {
      throw new ConflictError("Email already registered.");
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

    // Abre automaticamente a primeira carteira
    await this.openAccountService.execute(user.id, data.countryId);

    return this.createSession(user.id, user.role);
  }

  // =====================================================
  // LOGIN
  // =====================================================

  async login(data: LoginDTO) {
    const user = await this.repository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError("Invalid credentials.");
    }

    const passwordIsValid = await argon2.verify(
      user.passwordHash,
      data.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedError("Invalid credentials.");
    }

    return this.createSession(user.id, user.role);
  }

  // =====================================================
  // REFRESH TOKEN
  // =====================================================

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    const storedToken = await this.repository.findRefreshTokenByJti(
      payload.jti,
    );

    if (!storedToken) {
      throw new UnauthorizedError("Refresh token not found.");
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedError("Refresh token revoked.");
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token expired.");
    }

    const validToken = await argon2.verify(storedToken.tokenHash, refreshToken);

    if (!validToken) {
      throw new UnauthorizedError("Invalid refresh token.");
    }

    await this.repository.revokeRefreshToken(storedToken.id);

    return this.createSession(storedToken.user.id, storedToken.user.role);
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async logout(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    const storedToken = await this.repository.findRefreshTokenByJti(
      payload.jti,
    );

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

  private async createSession(userId: string, role: string) {
    

    const existingUser = await this.repository.findById(userId);

    

    const accessToken = generateAccessToken(userId, role);

    const { token: refreshToken, jti } = generateRefreshToken(userId);

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
