import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../../infra/database/prisma.js";

import { CreateExchangeRateDTO } from "../dto/CreateExchangeRateDTO.js";

type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

interface UpdateExchangeRateDTO {
  rate?: Prisma.Decimal | number;
  source?: string;
}

export class ExchangeRateRepository {
  constructor(
    private readonly db: PrismaExecutor = prisma
  ) {}

  async create(data: CreateExchangeRateDTO) {
    return this.db.exchangeRate.create({
      data,
      include: {
        baseCurrency: true,
        quoteCurrency: true,
      },
    });
  }

  async findAll() {
    return this.db.exchangeRate.findMany({
      include: {
        baseCurrency: true,
        quoteCurrency: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return this.db.exchangeRate.findUnique({
      where: { id },
      include: {
        baseCurrency: true,
        quoteCurrency: true,
      },
    });
  }

  async findByCurrencies(
    baseCurrencyId: string,
    quoteCurrencyId: string
  ) {
    return this.db.exchangeRate.findUnique({
      where: {
        baseCurrencyId_quoteCurrencyId: {
          baseCurrencyId,
          quoteCurrencyId,
        },
      },
    });
  }

  async update(
    id: string,
    data: UpdateExchangeRateDTO
  ) {
    return this.db.exchangeRate.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.db.exchangeRate.delete({
      where: { id },
    });
  }
}