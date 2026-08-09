import argon2 from "argon2";
import { AuthTokenType, AccountCategory, UserStatus } from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";

import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

import { generateAccountNumber } from "../../../shared/utils/generateAccountNumber.js";
import { generateAuthToken } from "../../../shared/utils/generateAuthToken.js";
import { generateProfileNumber } from "../../../shared/utils/generateProfileNumber.js";
import { generateUserNumber } from "../../../shared/utils/generateUserNumber.js";
import { generateWalletNumber } from "../../../shared/utils/generateWalletNumber.js";
import { hashToken } from "../../../shared/utils/hashToken.js";

import type { RegisterDTO } from "../dtos/RegisterDTO.js";
import type { VerifyEmailDTO } from "../dtos/VerifyEmailDTO.js";

import { AuthTokenRepository } from "../repositories/AuthTokenRepository.js";
import { UsersRepository } from "../../users/repositories/UsersRepository.js";

export class AuthService {
  private usersRepository = new UsersRepository();
  private authTokenRepository = new AuthTokenRepository();

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

  async verifyEmail(data: VerifyEmailDTO) {
    const tokenHash = hashToken(data.token);

    const authToken = await this.authTokenRepository.findByTokenHash(tokenHash);

    if (!authToken) {
      throw new UnauthorizedError("Invalid verification token.");
    }

    if (authToken.type !== AuthTokenType.EMAIL_VERIFICATION) {
      throw new UnauthorizedError("Invalid verification token.");
    }

    if (authToken.usedAt) {
      throw new UnauthorizedError("Verification token has already been used.");
    }

    if (authToken.expiresAt < new Date()) {
      throw new UnauthorizedError("Verification token has expired.");
    }

    const user = await this.usersRepository.findById(authToken.userId);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const pendingRegistration = await prisma.pendingRegistration.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!pendingRegistration) {
      throw new NotFoundError("Pending registration not found.");
    }

    if (user.emailVerified) {
      throw new ConflictError("Email is already verified.");
    }

    /*
     * Country and currency are resolved from the
     * country code stored during registration.
     */
    const country = await prisma.country.findUnique({
      where: {
        iso2Code: pendingRegistration.countryCode,
      },
    });

    if (!country) {
      throw new NotFoundError("Country not found.");
    }

    const countryCurrency = await prisma.countryCurrency.findFirst({
      where: {
        countryId: country.id,
        isDefault: true,
      },
      include: {
        currency: true,
      },
    });

    if (!countryCurrency) {
      throw new NotFoundError("Default currency for country not found.");
    }

    const displayName =
      `${pendingRegistration.firstName} ${pendingRegistration.lastName}`.trim();

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
          lastName: pendingRegistration.firstName.trim(),
          phoneCountryCode: country.phoneCode,
          phoneNumber: pendingRegistration.phone.trim(),
          languageCode:
            pendingRegistration.languageCode?.trim().toLowerCase() ?? null,
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
