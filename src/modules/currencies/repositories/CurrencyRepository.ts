import { prisma } from "../../../infra/database/prisma.js";

export class CurrencyRepository {
  async findById(id: string) {
    return prisma.currency.findUnique({
      where: {
        id,
      },
    });
  }

  async findByCode(code: string) {
    return prisma.currency.findUnique({
      where: {
        code,
      },
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
}