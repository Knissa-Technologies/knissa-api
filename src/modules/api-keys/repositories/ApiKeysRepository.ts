import { prisma } from "../../../infra/database/prisma.js";
import { Prisma } from "@prisma/client";

export class ApiKeysRepository {
  async findProfileByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: {
        userId,
      },
    });
  }

  async findAccountsByProfileId(profileId: string) {
    return prisma.account.findMany({
      where: {
        profileId,
      },
      select: {
        id: true,
      },
    });
  }

  async create(data: Prisma.ApiKeyUncheckedCreateInput) {
    return prisma.apiKey.create({
      data,
    });
  }

  async findAllByAccountIds(accountIds: string[]) {
  return prisma.apiKey.findMany({
    where: {
      accountId: {
        in: accountIds,
      },
    },
    select: {
      id: true,
      apiKeyNumber: true,
      accountId: true,
      name: true,
      prefix: true,
      environment: true,
      status: true,
      scopes: true,
      lastUsedAt: true,
      expiresAt: true,
      revokedAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async findByIdAndAccountIds(
  id: string,
  accountIds: string[],
) {
  return prisma.apiKey.findFirst({
    where: {
      id,
      accountId: {
        in: accountIds,
      },
    },
    select: {
      id: true,
      apiKeyNumber: true,
      accountId: true,
      name: true,
      prefix: true,
      environment: true,
      status: true,
      scopes: true,
      lastUsedAt: true,
      expiresAt: true,
      revokedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

  async revoke(id: string) {
  return prisma.apiKey.update({
    where: {
      id,
    },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
    },
    select: {
      id: true,
      apiKeyNumber: true,
      accountId: true,
      name: true,
      prefix: true,
      environment: true,
      status: true,
      scopes: true,
      lastUsedAt: true,
      expiresAt: true,
      revokedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

  async delete(id: string) {
    return prisma.apiKey.delete({
      where: {
        id,
      },
    });
  }
}
