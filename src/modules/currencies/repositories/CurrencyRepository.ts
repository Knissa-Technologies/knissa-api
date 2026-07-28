import { prisma } from "../../../infra/database/prisma.js";

interface CreateCurrencyDTO {
  code: string;
  name: string;
  symbol: string;
  decimals?: number;
}

interface UpdateCurrencyDTO {
  code?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  isActive?: boolean;
}

export class CurrencyRepository {
  async findById(id: string) {
    return prisma.currency.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string) {
    return prisma.currency.findUnique({
      where: { code },
    });
  }

  async findAll() {
    return prisma.currency.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        code: "asc",
      },
    });
  }

  async create(data: CreateCurrencyDTO) {
    return prisma.currency.create({
      data,
    });
  }

  async update(id: string, data: UpdateCurrencyDTO) {
    return prisma.currency.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.currency.delete({
      where: { id },
    });
  }
}