import { prisma } from "../../../infra/database/prisma.js";

import type { AuthTokenType } from "@prisma/client";

export class AuthTokenRepository {
  async create(data: {
    userId: string;
    type: AuthTokenType;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.authToken.create({
      data,
    });
  }

  async findByTokenHash(tokenHash: string) {
    return prisma.authToken.findUnique({
      where: {
        tokenHash,
      },
    });
  }

  async markAsUsed(id: string) {
    return prisma.authToken.update({
      where: {
        id,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }
}