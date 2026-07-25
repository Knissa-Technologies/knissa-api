import { afterAll, beforeEach } from "vitest";
import { prisma } from "../src/infra/database/prisma";

beforeEach(async () => {
  await prisma.refreshToken.deleteMany();

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