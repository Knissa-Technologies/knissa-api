import argon2 from "argon2";

import {
  AccountCategory,
  AuthTokenType,
  SessionStatus,
  UserStatus,
} from "@prisma/client";

import { randomUUID } from "crypto";

import { prisma } from "../../../infra/database/prisma.js";

import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

import { generateAccessToken } from "../../../shared/utils/generateAccessToken.js";
import { generateAccountNumber } from "../../../shared/utils/generateAccountNumber.js";
import { generateAuthToken } from "../../../shared/utils/generateAuthToken.js";
import { generateProfileNumber } from "../../../shared/utils/generateProfileNumber.js";
import { generateRefreshToken } from "../../../shared/utils/generateRefreshToken.js";
import { generateUserNumber } from "../../../shared/utils/generateUserNumber.js";
import { generateWalletNumber } from "../../../shared/utils/generateWalletNumber.js";
import { hashToken } from "../../../shared/utils/hashToken.js";

import type { LoginDTO } from "../dtos/LoginDTO.js";
import type { RegisterDTO } from "../dtos/RegisterDTO.js";
import type { VerifyEmailDTO } from "../dtos/VerifyEmailDTO.js";
import type { RefreshTokenDTO } from "../dtos/RefreshTokenDTO.js";

import { AuthTokenRepository } from "../repositories/AuthTokenRepository.js";
import { SessionRepository } from "../repositories/SessionRepository.js";
import { UsersRepository } from "../../users/repositories/UsersRepository.js";

import { MfaService } from "./MfaService.js";

export class AuthService {
  private usersRepository = new UsersRepository();
  private authTokenRepository = new AuthTokenRepository();
  private sessionRepository = new SessionRepository();
  private mfaService = new MfaService();

  // ======================================================
  // REGISTER
  // ======================================================

  async register(data: RegisterDTO) {
    const email = data.email.trim().toLowerCase();

    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictError("Email already exists.");
    }

    const passwordHash = await argon2.hash(data.password);

    const userNumber = generateUserNumber();

    const user = await this.usersRepository.create({
      userNumber,
      email,
      passwordHash,
    });

    await prisma.pendingRegistration.create({
      data: {
        userId: user.id,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        countryCode: data.countryCode.trim().toUpperCase(),
        phone: data.phone.trim(),
        languageCode: data.languageCode?.trim().toLowerCase() ?? null,
      },
    });

    const verificationToken = generateAuthToken();

    const tokenHash = hashToken(verificationToken);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.authTokenRepository.create({
      userId: user.id,
      type: AuthTokenType.EMAIL_VERIFICATION,
      tokenHash,
      expiresAt,
    });

    console.log(
      `📧 Email verification token for ${email}: ${verificationToken}`,
    );

    return {
      id: user.id,
      userNumber: user.userNumber,
      email: user.email,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }

  // ======================================================
  // LOGIN
  // ======================================================

  async login(data: LoginDTO) {
    const email = data.email.trim().toLowerCase();

    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    if (!user.emailVerified) {
      throw new UnauthorizedError("Please verify your email first.");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError("User account is not active.");
    }

    const now = new Date();

    if (user.lockedUntil && user.lockedUntil > now) {
      throw new UnauthorizedError("Account is temporarily locked.");
    }

    /*
     * If the previous lock has expired, reset the login attempts.
     */
    if (user.lockedUntil && user.lockedUntil <= now) {
      await this.usersRepository.update(user.id, {
        failedLoginAttempts: 0,
        lockedUntil: null,
      });

      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
    }

    const passwordValid = await argon2.verify(
      user.passwordHash,
      data.password,
    );

    if (!passwordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;

      if (failedAttempts >= 5) {
        const lockedUntil = new Date(now.getTime() + 15 * 60 * 1000);

        await this.usersRepository.update(user.id, {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        });

        throw new UnauthorizedError("Account is temporarily locked.");
      }

      await this.usersRepository.update(user.id, {
        failedLoginAttempts: failedAttempts,
      });

      throw new UnauthorizedError("Invalid email or password.");
    }

    // ======================================================
    // MFA CHECK
    // ======================================================

    const mfaCredential = await prisma.mfaCredential.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (mfaCredential?.enabled) {
      const challengeToken = generateAuthToken();

      const challengeHash = hashToken(challengeToken);

      const challengeExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await this.authTokenRepository.create({
        userId: user.id,
        type: AuthTokenType.MFA_LOGIN,
        tokenHash: challengeHash,
        expiresAt: challengeExpiresAt,
      });

      return {
        mfaRequired: true,
        challengeToken,
        expiresAt: challengeExpiresAt,
      };
    }

    // ======================================================
    // NORMAL LOGIN WITHOUT MFA
    // ======================================================

    return this.createAuthenticatedSession(user.id, user.role);
  }

  // ======================================================
  // MFA LOGIN
  // ======================================================

  async verifyMfaLogin(challengeToken: string, code: string) {
    const tokenHash = hashToken(challengeToken);

    const authToken =
      await this.authTokenRepository.findByTokenHash(tokenHash);

    if (!authToken) {
      throw new UnauthorizedError("Invalid MFA challenge.");
    }

    if (authToken.type !== AuthTokenType.MFA_LOGIN) {
      throw new UnauthorizedError("Invalid MFA challenge.");
    }

    if (authToken.usedAt) {
      throw new UnauthorizedError("MFA challenge has already been used.");
    }

    if (authToken.expiresAt < new Date()) {
      throw new UnauthorizedError("MFA challenge has expired.");
    }

    const user = await this.usersRepository.findByEmail(
      (
        await prisma.user.findUnique({
          where: {
            id: authToken.userId,
          },
          select: {
            email: true,
          },
        })
      )?.email ?? "",
    );

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError("User account is not active.");
    }

    if (!user.emailVerified) {
      throw new UnauthorizedError("Please verify your email first.");
    }

    // ======================================================
    // VERIFY TOTP
    // ======================================================

    await this.mfaService.verifyLoginCode(user.id, code);

    // ======================================================
    // CONSUME MFA CHALLENGE
    // ======================================================

    const challengeConsumed =
      await this.authTokenRepository.consumeMfaChallenge(authToken.id);

    if (!challengeConsumed) {
      throw new UnauthorizedError("MFA challenge has already been used.");
    }

    // ======================================================
    // COMPLETE LOGIN
    // ======================================================

    const result = await this.createAuthenticatedSession(
      user.id,
      user.role,
    );

    await this.usersRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    });

    return result;
  }

  // ======================================================
  // CREATE AUTHENTICATED SESSION
  // ======================================================

  private async createAuthenticatedSession(
    userId: string,
    role: string,
  ) {
    const user = await this.usersRepository.findByEmail(
      (
        await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            email: true,
          },
        })
      )?.email ?? "",
    );

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const sessionReference = randomUUID();

    const refreshToken = generateRefreshToken();

    const refreshTokenHash = hashToken(refreshToken);

    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    );

    const session = await this.sessionRepository.create({
      reference: sessionReference,
      userId,
      refreshTokenHash,
      deviceType: "UNKNOWN",
      isTrusted: false,
      expiresAt,
    });

    const accessToken = generateAccessToken({
      userId,
      sessionId: session.id,
      role,
    });

    await this.usersRepository.update(userId, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    });

    return {
      user: {
        id: user.id,
        userNumber: user.userNumber,
        email: user.email,
        role: user.role,
        status: user.status,
      },

      session: {
        id: session.id,
        reference: session.reference,
        expiresAt: session.expiresAt,
      },

      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  // ======================================================
  // REFRESH TOKEN
  // ======================================================

  async refresh(data: RefreshTokenDTO) {
    const refreshTokenHash = hashToken(data.refreshToken);

    const session =
      await this.sessionRepository.findByRefreshTokenHash(
        refreshTokenHash,
      );

    if (!session) {
      throw new UnauthorizedError("Invalid refresh token.");
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new UnauthorizedError("Session is no longer active.");
    }

    if (session.revokedAt) {
      throw new UnauthorizedError("Session has been revoked.");
    }

    if (session.previousRefreshTokenHash === refreshTokenHash) {
      await this.sessionRepository.revoke(session.id, "TOKEN_REUSE");

      throw new UnauthorizedError(
        "Refresh token reuse detected. Session has been revoked.",
      );
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new UnauthorizedError("Session is no longer active.");
    }

    if (session.revokedAt) {
      throw new UnauthorizedError("Session has been revoked.");
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.revoke(
        session.id,
        "TOKEN_REUSE",
      );

      throw new UnauthorizedError("Refresh token has expired.");
    }

    const user = await this.usersRepository.findById(session.userId);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    if (user.status !== UserStatus.ACTIVE || !user.emailVerified) {
      throw new UnauthorizedError("User account is not active.");
    }

    const newRefreshToken = generateRefreshToken();

    const newRefreshTokenHash = hashToken(newRefreshToken);

    const newExpiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    );

    const updatedSession =
      await this.sessionRepository.rotateRefreshToken(
        session.id,
        refreshTokenHash,
        newRefreshTokenHash,
        newExpiresAt,
      );

    const accessToken = generateAccessToken({
      userId: user.id,
      sessionId: updatedSession.id,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,

      session: {
        id: updatedSession.id,
        reference: updatedSession.reference,
        expiresAt: updatedSession.expiresAt,
      },
    };
  }

  // ======================================================
  // LOGOUT
  // ======================================================

  async logout(sessionId: string) {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundError("Session not found.");
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new UnauthorizedError("Session is no longer active.");
    }

    const revokedSession = await this.sessionRepository.revoke(
      session.id,
      "USER_LOGOUT",
    );

    return {
      sessionId: revokedSession.id,
      status: revokedSession.status,
    };
  }

  // ======================================================
  // GET SESSIONS
  // ======================================================

  async getSessions(userId: string) {
    return this.sessionRepository.findActiveByUserId(userId);
  }

  // ======================================================
  // REVOKE SESSION
  // ======================================================

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundError("Session not found.");
    }

    if (session.userId !== userId) {
      throw new UnauthorizedError(
        "You cannot revoke this session.",
      );
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new UnauthorizedError("Session is no longer active.");
    }

    const revokedSession = await this.sessionRepository.revoke(
      session.id,
      "USER_LOGOUT",
    );

    return {
      sessionId: revokedSession.id,
      status: revokedSession.status,
    };
  }

  // ======================================================
  // CHANGE PASSWORD
  // ======================================================

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user =
      await this.usersRepository.findByIdWithPassword(userId);

    if (!user) {
      throw new UnauthorizedError("User not found.");
    }

    const currentPasswordValid = await argon2.verify(
      user.passwordHash,
      currentPassword,
    );

    if (!currentPasswordValid) {
      throw new UnauthorizedError(
        "Current password is incorrect.",
      );
    }

    if (currentPassword === newPassword) {
      throw new UnauthorizedError(
        "New password must be different from the current password.",
      );
    }

    const newPasswordHash = await argon2.hash(newPassword);

    const now = new Date();

    await this.usersRepository.update(user.id, {
      passwordHash: newPasswordHash,
      passwordChangedAt: now,
    });

    await this.sessionRepository.revokeAllByUserId(
      user.id,
      "PASSWORD_CHANGED",
    );

    return {
      passwordChangedAt: now,
      sessionsRevoked: true,
    };
  }

  // ======================================================
  // VERIFY EMAIL
  // ======================================================

  async verifyEmail(data: VerifyEmailDTO) {
    const tokenHash = hashToken(data.token);

    const authToken =
      await this.authTokenRepository.findByTokenHash(tokenHash);

    if (!authToken) {
      throw new UnauthorizedError(
        "Invalid verification token.",
      );
    }

    if (authToken.type !== AuthTokenType.EMAIL_VERIFICATION) {
      throw new UnauthorizedError(
        "Invalid verification token.",
      );
    }

    if (authToken.usedAt) {
      throw new UnauthorizedError(
        "Verification token has already been used.",
      );
    }

    if (authToken.expiresAt < new Date()) {
      throw new UnauthorizedError(
        "Verification token has expired.",
      );
    }

    const user = await this.usersRepository.findById(
      authToken.userId,
    );

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const pendingRegistration =
      await prisma.pendingRegistration.findUnique({
        where: {
          userId: user.id,
        },
      });

    if (!pendingRegistration) {
      throw new NotFoundError(
        "Pending registration not found.",
      );
    }

    if (user.emailVerified) {
      throw new ConflictError("Email is already verified.");
    }

    // ------------------------------------------------------
    // Country
    // ------------------------------------------------------

    const country = await prisma.country.findUnique({
      where: {
        iso2Code: pendingRegistration.countryCode,
      },
    });

    if (!country) {
      throw new NotFoundError("Country not found.");
    }

    // ------------------------------------------------------
    // Default currency
    // ------------------------------------------------------

    const countryCurrency =
      await prisma.countryCurrency.findFirst({
        where: {
          countryId: country.id,
          isDefault: true,
        },
        include: {
          currency: true,
        },
      });

    if (!countryCurrency) {
      throw new NotFoundError(
        "Default currency for country not found.",
      );
    }

    const displayName =
      `${pendingRegistration.firstName} ${pendingRegistration.lastName}`.trim();

    // ------------------------------------------------------
    // Complete onboarding transaction
    // ------------------------------------------------------

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: UserStatus.ACTIVE,
          emailVerified: true,
        },
      });

      await tx.authToken.update({
        where: {
          id: authToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      });

      const profile = await tx.profile.create({
        data: {
          profileNumber: generateProfileNumber(),

          userId: user.id,

          displayName,

          legalName: displayName,

          firstName: pendingRegistration.firstName.trim(),

          lastName: pendingRegistration.lastName.trim(),

          phoneCountryCode: country.phoneCode,

          phoneNumber: pendingRegistration.phone.trim(),

          languageCode:
            pendingRegistration.languageCode
              ?.trim()
              .toLowerCase() ?? null,
        },
      });

      const account = await tx.account.create({
        data: {
          accountNumber: generateAccountNumber(),

          profileId: profile.id,

          category: AccountCategory.PERSONAL,

          status: "ACTIVE",

          displayName,

          legalName: displayName,

          countryId: country.id,

          baseCurrencyId: countryCurrency.currencyId,

          isDefault: true,
        },
      });

      const wallet = await tx.wallet.create({
        data: {
          walletNumber: generateWalletNumber(),

          accountId: account.id,

          currencyId: countryCurrency.currencyId,

          isDefault: true,
        },
      });

      // --------------------------------------------------
      // Registration completed
      // --------------------------------------------------

      await tx.pendingRegistration.delete({
        where: {
          userId: user.id,
        },
      });

      return {
        user: updatedUser,
        profile,
        account,
        wallet,
      };
    });

    return {
      user: {
        id: result.user.id,
        userNumber: result.user.userNumber,
        email: result.user.email,
        status: result.user.status,
        emailVerified: result.user.emailVerified,
      },

      profile: {
        id: result.profile.id,
        profileNumber: result.profile.profileNumber,
        displayName: result.profile.displayName,
      },

      account: {
        id: result.account.id,
        accountNumber: result.account.accountNumber,
        category: result.account.category,
        status: result.account.status,
      },

      wallet: {
        id: result.wallet.id,
        walletNumber: result.wallet.walletNumber,
        currencyId: result.wallet.currencyId,
        status: result.wallet.status,
      },
    };
  }
}