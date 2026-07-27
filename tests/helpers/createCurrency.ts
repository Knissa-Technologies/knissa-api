import { prisma } from "../../src/infra/database/prisma.js";

export async function createCurrency(
  code: string,
  name: string,
  symbol: string,
) {
  return prisma.currency.upsert({
    where: {
      code,
    },
    update: {
      name,
      symbol,
      decimals: 2,
      isActive: true,
    },
    create: {
      code,
      name,
      symbol,
      decimals: 2,
      isActive: true,
    },
  });
}