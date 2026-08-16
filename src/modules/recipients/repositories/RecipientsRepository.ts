import { prisma } from "../../../infra/database/prisma.js";

import type { CreateRecipientDTO } from "../dtos/CreateRecipientDTO.js";
import type { UpdateRecipientDTO } from "../dtos/UpdateRecipientDTO.js";

const recipientSelect = {
  id: true,
  recipientNumber: true,

  ownerAccountId: true,
  destinationAccountId: true,

  displayName: true,
  accountNumber: true,

  type: true,
  status: true,

  nickname: true,
  avatarUrl: true,

  createdAt: true,
  updatedAt: true,
} as const;

export class RecipientsRepository {
  async findProfileByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
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
        accountNumber: true,
      },
    });
  }

  async findAccountByNumber(accountNumber: string) {
    return prisma.account.findUnique({
      where: {
        accountNumber,
      },
      select: {
        id: true,
        accountNumber: true,
        displayName: true,
        category: true,
        status: true,
      },
    });
  }

  async findAllByOwnerAccountIds(ownerAccountIds: string[]) {
    return prisma.recipient.findMany({
      where: {
        ownerAccountId: {
          in: ownerAccountIds,
        },
      },
      orderBy: [
        {
          status: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: recipientSelect,
    });
  }

  async findByIdAndOwnerAccountIds(
    id: string,
    ownerAccountIds: string[],
  ) {
    return prisma.recipient.findFirst({
      where: {
        id,
        ownerAccountId: {
          in: ownerAccountIds,
        },
      },
      select: recipientSelect,
    });
  }

  async findByOwnerAndDestination(
    ownerAccountId: string,
    destinationAccountId: string,
  ) {
    return prisma.recipient.findUnique({
      where: {
        ownerAccountId_destinationAccountId: {
          ownerAccountId,
          destinationAccountId,
        },
      },
      select: recipientSelect,
    });
  }

  async create(
    ownerAccountId: string,
    destinationAccountId: string,
    data: CreateRecipientDTO & {
      recipientNumber: string;
      displayName: string;
      accountNumber: string;
    },
  ) {
    return prisma.recipient.create({
      data: {
        recipientNumber: data.recipientNumber,

        ownerAccountId,
        destinationAccountId,

        displayName: data.displayName,
        accountNumber: data.accountNumber,

        type: data.type,

        nickname: data.nickname,
        avatarUrl: data.avatarUrl,
      },
      select: recipientSelect,
    });
  }

  async update(id: string, data: UpdateRecipientDTO) {
    return prisma.recipient.update({
      where: {
        id,
      },
      data,
      select: recipientSelect,
    });
  }
}
