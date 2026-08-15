import { prisma } from "../../../infra/database/prisma.js";

import type { UpdateAccountDTO } from "../dtos/UpdateAccountDTO.js";

const accountSelect = {
  id: true,
  accountNumber: true,
  profileId: true,

  category: true,
  status: true,

  displayName: true,
  legalName: true,

  countryId: true,
  languageId: true,
  timezoneId: true,

  baseCurrencyId: true,
  isDefault: true,

  createdAt: true,
  updatedAt: true,
} as const;

export class AccountsRepository {
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

  async findAllByProfileId(profileId: string) {
    return prisma.account.findMany({
      where: {
        profileId,
      },
      orderBy: [
        {
          isDefault: "desc",
        },
        {
          createdAt: "asc",
        },
      ],
      select: accountSelect,
    });
  }

  async findByIdAndProfileId(id: string, profileId: string) {
    return prisma.account.findFirst({
      where: {
        id,
        profileId,
      },
      select: accountSelect,
    });
  }

  async update(id: string, data: UpdateAccountDTO) {
    return prisma.account.update({
      where: {
        id,
      },
      data,
      select: accountSelect,
    });
  }
}
