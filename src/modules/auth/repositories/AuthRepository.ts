import { prisma } from "../../../infra/database/prisma.js";

export class AuthRepository {
  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    phone?: string;
    countryId: string;
  }) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        role: true,
        status: true,
        countryId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async createRefreshToken(data: {
    userId: string;
    jti: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({
      data: {
        jti: data.jti,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        user: {
          connect: {
            id: data.userId,
          },
        },
      },
    });
  }

  async findRefreshTokenByJti(jti: string) {
    return prisma.refreshToken.findUnique({
      where: {
        jti,
      },
      include: {
        user: true,
      },
    });
  }

  async revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: {
        id,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
