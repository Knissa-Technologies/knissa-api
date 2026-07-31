import { prisma } from "../../../infra/database/prisma.js";

export class DashboardRepository {

  async getUser(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });
  }

  async getWallets(userId: string) {
    return prisma.wallet.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        accountNumber: true,
        balance: true,
        status: true,
        createdAt: true,

        currency: {
          select: {
            id: true,
            code: true,
            symbol: true,
            name: true,
          },
        },
      },
    });
  }

  async getRecentTransactions(userId: string) {
    return prisma.transaction.findMany({
      where: {
        wallet: {
          userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        type: true,
        status: true,
        amount: true,
        description: true,
        createdAt: true,

        currency: {
          select: {
            code: true,
            symbol: true,
          },
        },

        wallet: {
          select: {
            accountNumber: true,
          },
        },
      },
    });
  }

  async countTransactions(userId: string) {
    return prisma.transaction.count({
      where: {
        wallet: {
          userId,
        },
      },
    });
  }

}