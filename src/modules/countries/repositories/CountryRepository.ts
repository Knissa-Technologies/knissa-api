import { prisma } from "../../../infra/database/prisma.js";

export class CountryRepository {
  async findById(id: string) {
    return prisma.country.findUnique({
      where: {
        id,
      },
    });
  }


  async findAll() {
    return prisma.country.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async findByIsoCode(isoCode: string) {
    return prisma.country.findUnique({
      where: {
        isoCode,
      },
    });
  }
}