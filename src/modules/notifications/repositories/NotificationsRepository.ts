import { Prisma } from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";

export class NotificationsRepository {
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

  async create(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.notification.findUnique({
      where: {
        id,
      },
    });
  }

  async findByAccountId(accountId: string) {
    return prisma.notification.findMany({
      where: {
        accountId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByAccountIds(accountIds: string[]) {
    return prisma.notification.findMany({
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

  async findByIdAndAccountIds(
    id: string,
    accountIds: string[],
  ) {
    return prisma.notification.findFirst({
      where: {
        id,
        accountId: {
          in: accountIds,
        },
      },
    });
  }

  async countUnreadByAccountIds(accountIds: string[]) {
    return prisma.notification.count({
      where: {
        accountId: {
          in: accountIds,
        },
        status: {
          not: "READ",
        },
      },
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: {
        id,
      },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });
  }
}