import { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";

type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

interface CreateWalletDTO {
  userId: string;
  currencyId: string;
  accountNumber: string;
}

export class WalletRepository {
  constructor(
    private readonly db: PrismaExecutor = prisma
  ) { }

  async create(data: CreateWalletDTO) {
    return this.db.wallet.create({
      data: {
        userId: data.userId,
        currencyId: data.currencyId,
        accountNumber: data.accountNumber,
        balance: 0,
      },
      include: {
        currency: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.db.wallet.findFirst({
      where: {
        userId,
      },
      include: {
        currency: true,
      },
    });
  }

  async findByAccountNumber(accountNumber: string) {
    return this.db.wallet.findUnique({
      where: {
        accountNumber,
      },
    });
  }

  async findByAccountNumberWithCurrency(accountNumber: string) {
    return this.db.wallet.findUnique({
      where: {
        accountNumber,
      },
      include: {
        currency: true,
      },
    });
  }

  async updateBalance(id: string, balance: number) {
    return this.db.wallet.update({
      where: {
        id,
      },
      data: {
        balance,
      },
    });
  }


  async updateBalanceByAmount(id: string, amount: number) {
    return this.db.wallet.update({
      where: {
        id,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  async decreaseBalance(id: string, amount: number) {
    return this.db.wallet.update({
      where: {
        id,
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });
  }


  async findCurrencyByCode(code: string) {
    return this.db.currency.findUnique({
      where: {
        code,
      },
    });
  }
}