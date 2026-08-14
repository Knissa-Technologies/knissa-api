import { verify, generateSecret, generateURI } from "otplib";

import { prisma } from "../../../infra/database/prisma.js";

import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

export class MfaService {
  // ======================================================
  // MFA ENROLLMENT
  // ======================================================

  async enroll(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    let credential = await prisma.mfaCredential.findUnique({
      where: {
        userId,
      },
    });

    if (credential?.enabled) {
      throw new UnauthorizedError("MFA is already enabled.");
    }

    const secret = generateSecret();

    const uri = generateURI({
      issuer: "Knissa",
      label: user.email,
      secret,
    });

    if (credential) {
      credential = await prisma.mfaCredential.update({
        where: {
          userId,
        },
        data: {
          secret,
          enabled: false,
          verifiedAt: null,
        },
      });
    } else {
      credential = await prisma.mfaCredential.create({
        data: {
          userId,
          secret,
          enabled: false,
          verifiedAt: null,
        },
      });
    }

    return {
      secret,
      uri,
      enabled: credential.enabled,
    };
  }

  // ======================================================
  // MFA LOGIN CODE
  // ======================================================

  async verifyLoginCode(userId: string, code: string) {
    const credential = await prisma.mfaCredential.findUnique({
      where: {
        userId,
      },
    });

    if (!credential) {
      throw new NotFoundError("MFA credential not found.");
    }

    if (!credential.enabled) {
      throw new UnauthorizedError("MFA is not enabled.");
    }

    const result = await verify({
      secret: credential.secret,
      token: code,
    });

    if (!result.valid) {
      throw new UnauthorizedError("Invalid MFA code.");
    }

    return {
      valid: true,
    };
  }

  // ======================================================
  // MFA ENROLLMENT VERIFICATION
  // ======================================================

  async verifyCode(userId: string, code: string) {
    const credential = await prisma.mfaCredential.findUnique({
      where: {
        userId,
      },
    });

    if (!credential) {
      throw new NotFoundError("MFA enrollment not found.");
    }

    if (credential.enabled) {
      throw new UnauthorizedError("MFA is already enabled.");
    }

    const result = await verify({
      secret: credential.secret,
      token: code,
    });

    if (!result.valid) {
      throw new UnauthorizedError("Invalid MFA code.");
    }

    const now = new Date();

    const updatedCredential = await prisma.mfaCredential.update({
      where: {
        userId,
      },
      data: {
        enabled: true,
        verifiedAt: now,
      },
    });

    return {
      enabled: updatedCredential.enabled,
      verifiedAt: updatedCredential.verifiedAt,
    };
  }
}