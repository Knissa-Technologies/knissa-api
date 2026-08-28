import { prisma } from "../../../infra/database/prisma.js";

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

  async create(data: any) {
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
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByIdAndAccountIds(id: string, accountIds: string[]) {
    return prisma.apiKey.findFirst({
      where: {
        id,
        accountId: {
          in: accountIds,
        },
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
