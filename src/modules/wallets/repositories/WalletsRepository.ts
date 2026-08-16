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

  async findByIdAndAccountIds(
    id: string,
    accountIds: string[],
  ) {
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
}
