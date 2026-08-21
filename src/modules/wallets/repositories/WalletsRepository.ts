import { prisma } from "../../../infra/database/prisma.js";

const walletSelect = {
  id: true,
  walletNumber: true,
  accountId: true,
  currencyId: true,

  status: true,
  isDefault: true,

  availableBalance: true,
  reservedBalance: true,
  totalBalance: true,

  createdAt: true,
  updatedAt: true,
} as const;

export class WalletsRepository {
  async findProfileByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });
  }

  async findAccountsByProfileId(profileId: string) {
    return prisma.account.findMany({
      where: {
        profileId,
      },
      select: {
        id: true,
      },
    });
  }

  async findAllByAccountIds(accountIds: string[]) {
    return prisma.wallet.findMany({
      where: {
        accountId: {
          in: accountIds,
        },
      },
      orderBy: [
        {
          isDefault: "desc",
        },
        {
          createdAt: "asc",
        },
      ],
      select: walletSelect,
    });
  }

  async findByIdAndAccountIds(id: string, accountIds: string[]) {
    return prisma.wallet.findFirst({
      where: {
        id,
        accountId: {
          in: accountIds,
        },
      },
      select: walletSelect,
    });
  }

  // ======================================================
  // ACCOUNT
  // ======================================================

  async findAccountById(accountId: string) {
    return prisma.account.findUnique({
      where: {
        id: accountId,
      },
      select: {
        id: true,
        profileId: true,
        status: true,
      },
    });
  }

  // ======================================================
  // CURRENCY
  // ======================================================

  async findCurrencyById(currencyId: string) {
    return prisma.currency.findUnique({
      where: {
        id: currencyId,
      },
      select: {
        id: true,
        code: true,
        isActive: true,
      },
    });
  }

  // ======================================================
  // FIND WALLET BY ACCOUNT AND CURRENCY
  // ======================================================

  async findByAccountAndCurrency(accountId: string, currencyId: string) {
    return prisma.wallet.findUnique({
      where: {
        accountId_currencyId: {
          accountId,
          currencyId,
        },
      },
      select: walletSelect,
    });
  }

  // ======================================================
  // CREATE WALLET
  // ======================================================

  async create(data: {
    walletNumber: string;
    accountId: string;
    currencyId: string;
    isDefault?: boolean;
  }) {
    return prisma.wallet.create({
      data: {
        walletNumber: data.walletNumber,
        accountId: data.accountId,
        currencyId: data.currencyId,

        status: "ACTIVE",
        isDefault: data.isDefault ?? false,

        availableBalance: "0",
        reservedBalance: "0",
        totalBalance: "0",
      },

      select: walletSelect,
    });
  }
}
