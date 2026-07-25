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
    console.log("Email recebido:", JSON.stringify(email));

    const users = await prisma.user.findMany();

    console.log("Todos os usuários:");
    console.dir(users, { depth: null });

    const user = users.find(
      (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase(),
    );

    console.log("Usuário encontrado pelo JavaScript:", user);

    return user ?? null;
  }

  async createRefreshToken(data: {
    userId: string;
    jti: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({
      data,
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
