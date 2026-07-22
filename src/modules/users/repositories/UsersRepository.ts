import { prisma } from "../../../infra/database/prisma.js";
import { CreateUserDTO } from "../dto/CreateUserDTO.js";

export class UsersRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserDTO & { password: string }) {
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash: data.password,
        phone: data.phone,
        countryId: data.countryId,
      },
    });
  }

  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        countryId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }




  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
}


