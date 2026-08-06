import { UserStatus } from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";

import type { CreateUserDTO } from "../dtos/CreateUserDTO.js";

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
    }>,
  ) {
    return prisma.user.update({
      where: {
        id,
      },
      data,
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
    });
  }
}
