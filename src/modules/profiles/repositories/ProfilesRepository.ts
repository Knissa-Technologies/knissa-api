import { prisma } from "../../../infra/database/prisma.js";

import type { UpdateProfileDTO } from "../dtos/UpdateProfileDTO.js";

const profileSelect = {
  id: true,
  profileNumber: true,
  userId: true,

  displayName: true,
  legalName: true,

  firstName: true,
  middleName: true,
  lastName: true,

  birthDate: true,

  phoneCountryCode: true,
  phoneNumber: true,

  avatarUrl: true,

  languageCode: true,
  languageId: true,

  timezoneId: true,

  createdAt: true,
  updatedAt: true,
} as const;

export class ProfilesRepository {
  async findById(id: string) {
    return prisma.profile.findUnique({
      where: {
        id,
      },
      select: profileSelect,
    });
  }

  async findByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: {
        userId,
      },
      select: profileSelect,
    });
  }

  async update(id: string, data: UpdateProfileDTO) {
    return prisma.profile.update({
      where: {
        id,
      },
      data,
      select: profileSelect,
    });
  }
}