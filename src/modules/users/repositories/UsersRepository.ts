import { UserStatus } from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";

import type { CreateUserDTO } from "../dtos/CreateUserDTO.js";

const publicUserSelect = {
  id: true,
  userNumber: true,
  email: true,
  role: true,
  status: true,
  emailVerified: true,
  phoneVerified: true,
  failedLoginAttempts: true,
  lockedUntil: true,
  lastLoginAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  passwordChangedAt: true,
} as const;

export class UsersRepository {
  async create(data: CreateUserDTO) {
    return prisma.user.create({
      data,
    });
  }

  async findAll() {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: publicUserSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: publicUserSelect,
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      email: string;
      passwordHash: string;
      status: UserStatus;
      failedLoginAttempts: number;
      lockedUntil: Date | null;
      lastLoginAt: Date | null;
      passwordChangedAt: Date | null;
    }>,
  ) {
    return prisma.user.update({
      where: {
        id,
      },
      data,
      select: publicUserSelect,
    });
  }

  async findByIdWithPassword(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: publicUserSelect,
    });
  }
}
