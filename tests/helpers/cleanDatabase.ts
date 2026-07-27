


import { prisma } from "../../src/infra/database/prisma.js";

export async function cleanDatabase() {
  await prisma.refreshToken.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.exchangeRate.deleteMany();

  // apenas dados gerados pelos testes
  await prisma.user.deleteMany();

  // NÃO apagar tabelas de referência
  // await prisma.currency.deleteMany();
  // await prisma.country.deleteMany();
}