import { Prisma } from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";

import { BadRequestError } from "../../../shared/errors/BadRequestError.js";

const transactionSelect = {
  id: true,
  transactionNumber: true,

  sourceWalletId: true,
  destinationWalletId: true,

  currencyId: true,

  type: true,
  status: true,

  amount: true,
  feeAmount: true,
  netAmount: true,

  description: true,
  externalReference: true,

  idempotencyKey: true,

  completedAt: true,

  createdAt: true,
  updatedAt: true,
} as const;

export class TransactionsRepository {
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

  async findWalletsByAccountIds(accountIds: string[]) {
    return prisma.wallet.findMany({
      where: {
        accountId: {
          in: accountIds,
        },
      },
      select: {
        id: true,
      },
    });
  }

  async findAllByWalletIds(
    walletIds: string[],
    options: {
      skip: number;
      take: number;
      type?: string;
      status?: string;
    },
  ) {
    const where = {
      OR: [
        {
          sourceWalletId: {
            in: walletIds,
          },
        },
        {
          destinationWalletId: {
            in: walletIds,
          },
        },
      ],

      ...(options.type && {
        type: options.type as never,
      }),

      ...(options.status && {
        status: options.status as never,
      }),
    };

    const [transactions, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,

        skip: options.skip,

        take: options.take,

        orderBy: {
          createdAt: "desc",
        },

        select: transactionSelect,
      }),

      prisma.transaction.count({
        where,
      }),
    ]);

    return {
      transactions,
      total,
    };
  }

  async findByIdAndWalletIds(id: string, walletIds: string[]) {
    return prisma.transaction.findFirst({
      where: {
        id,
        OR: [
          {
            sourceWalletId: {
              in: walletIds,
            },
          },
          {
            destinationWalletId: {
              in: walletIds,
            },
          },
        ],
      },
      select: transactionSelect,
    });
  }

  async findByIdempotencyKey(idempotencyKey: string) {
    return prisma.transaction.findUnique({
      where: {
        idempotencyKey,
      },
      select: transactionSelect,
    });
  }

  async findWalletById(id: string) {
    return prisma.wallet.findUnique({
      where: {
        id,
      },
    });
  }

  // ======================================================
  // HANDLE PRISMA ERRORS
  // ======================================================

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new BadRequestError("Idempotency key has already been used.");
    }

    throw error;
  }

  async transfer(data: {
    transactionNumber: string;
    sourceWalletId: string;
    destinationWalletId: string;
    currencyId: string;
    amount: string;
    description?: string;
    idempotencyKey: string;
    sourceLedgerNumber: string;
    destinationLedgerNumber: string;
  }) {
    try {
      return await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            transactionNumber: data.transactionNumber,

            sourceWalletId: data.sourceWalletId,

            destinationWalletId: data.destinationWalletId,

            currencyId: data.currencyId,

            type: "TRANSFER",

            status: "PROCESSING",

            amount: data.amount,

            feeAmount: "0",

            netAmount: data.amount,

            description: data.description,

            idempotencyKey: data.idempotencyKey,
          },
        });

        const sourceUpdated = await tx.wallet.updateMany({
          where: {
            id: data.sourceWalletId,
            status: "ACTIVE",
            availableBalance: {
              gte: data.amount,
            },
          },
          data: {
            availableBalance: {
              decrement: data.amount,
            },
            totalBalance: {
              decrement: data.amount,
            },
          },
        });

        if (sourceUpdated.count !== 1) {
          throw new BadRequestError("Insufficient wallet balance.");
        }

        await tx.wallet.update({
          where: {
            id: data.destinationWalletId,
          },
          data: {
            availableBalance: {
              increment: data.amount,
            },
            totalBalance: {
              increment: data.amount,
            },
          },
        });

        const sourceWallet = await tx.wallet.findUniqueOrThrow({
          where: {
            id: data.sourceWalletId,
          },
        });

        const destinationWallet = await tx.wallet.findUniqueOrThrow({
          where: {
            id: data.destinationWalletId,
          },
        });

        await tx.ledgerEntry.create({
          data: {
            entryNumber: data.sourceLedgerNumber,

            walletId: data.sourceWalletId,

            transactionId: transaction.id,

            currencyId: data.currencyId,

            entryType: "DEBIT",

            amount: data.amount,

            balanceAfter: sourceWallet.totalBalance,

            description: data.description ?? "Transfer sent.",
          },
        });

        await tx.ledgerEntry.create({
          data: {
            entryNumber: data.destinationLedgerNumber,

            walletId: data.destinationWalletId,

            transactionId: transaction.id,

            currencyId: data.currencyId,

            entryType: "CREDIT",

            amount: data.amount,

            balanceAfter: destinationWallet.totalBalance,

            description: data.description ?? "Transfer received.",
          },
        });

        return tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
          select: transactionSelect,
        });
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async deposit(data: {
    transactionNumber: string;
    destinationWalletId: string;
    currencyId: string;
    amount: string;
    description?: string;
    idempotencyKey: string;
    ledgerNumber: string;
  }) {
    try {
      return await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            transactionNumber: data.transactionNumber,

            destinationWalletId: data.destinationWalletId,

            currencyId: data.currencyId,

            type: "DEPOSIT",

            status: "PROCESSING",

            amount: data.amount,

            feeAmount: "0",

            netAmount: data.amount,

            description: data.description,

            idempotencyKey: data.idempotencyKey,
          },
        });

        await tx.wallet.update({
          where: {
            id: data.destinationWalletId,
          },
          data: {
            availableBalance: {
              increment: data.amount,
            },

            totalBalance: {
              increment: data.amount,
            },
          },
        });

        const wallet = await tx.wallet.findUniqueOrThrow({
          where: {
            id: data.destinationWalletId,
          },
        });

        await tx.ledgerEntry.create({
          data: {
            entryNumber: data.ledgerNumber,

            walletId: data.destinationWalletId,

            transactionId: transaction.id,

            currencyId: data.currencyId,

            entryType: "CREDIT",

            amount: data.amount,

            balanceAfter: wallet.totalBalance,

            description: data.description ?? "Deposit received.",
          },
        });

        return tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
          select: transactionSelect,
        });
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }
}
