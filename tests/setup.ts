import { beforeEach, afterAll } from "vitest";
import { prisma } from "../src/infra/database/prisma";

beforeEach(async () => {
  // filhos mais profundos
  await prisma.ledgerEntry.deleteMany();

  await prisma.fee.deleteMany();

  await prisma.transaction.deleteMany();

  await prisma.refreshToken.deleteMany();

  await prisma.wallet.deleteMany();

  // por último os usuários de teste
  await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: "@test.com",
      },
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});