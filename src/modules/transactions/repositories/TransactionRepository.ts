import {
  Prisma,
  PrismaClient,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";

type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

interface CreateTransactionDTO {
  walletId: string;
  currencyId: string;

  type: TransactionType;
  status?: TransactionStatus;

  amount: Prisma.Decimal | number | string;
  feeAmount?: Prisma.Decimal | number | string;
  netAmount: Prisma.Decimal | number | string;

  description?: string;
  reference: string;
  externalReference?: string;
  completedAt?: Date;
}

export class TransactionRepository {
  constructor(
    private readonly db: PrismaExecutor = prisma
  ) {}

  async create(data: CreateTransactionDTO) {
    return this.db.transaction.create({
      data: {
        walletId: data.walletId,
        currencyId: data.currencyId,

        type: data.type,
        status: data.status ?? TransactionStatus.COMPLETED,

        amount: data.amount,
        feeAmount: data.feeAmount ?? 0,
        netAmount: data.netAmount,

        description: data.description,

        reference: data.reference,
        externalReference: data.externalReference,

        completedAt: data.completedAt ?? new Date(),
      },
    });
  }

  async findByReference(reference: string) {
    return this.db.transaction.findUnique({
      where: {
        reference,
      },
    });
  }

  async findByWallet(walletId: string) {
    return this.db.transaction.findMany({
      where: {
        walletId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}