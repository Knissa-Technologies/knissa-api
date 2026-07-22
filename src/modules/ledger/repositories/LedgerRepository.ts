import {
  LedgerEntryType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";

type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

interface CreateLedgerEntryDTO {
  walletId: string;
  transactionId: string;
  type: LedgerEntryType;
  amount: Prisma.Decimal | number | string;
}

export class LedgerRepository {
  constructor(
    private readonly db: PrismaExecutor = prisma
  ) {}

  async create(data: CreateLedgerEntryDTO) {
    return this.db.ledgerEntry.create({
      data: {
        walletId: data.walletId,
        transactionId: data.transactionId,
        type: data.type,
        amount: data.amount,
      },
    });
  }

  async findByTransaction(transactionId: string) {
    return this.db.ledgerEntry.findMany({
      where: {
        transactionId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }
}