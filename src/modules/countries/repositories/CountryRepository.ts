import { prisma } from "../../../infra/database/prisma.js";

interface CreateCountryDTO {
  name: string;
  isoCode: string;
  phoneCode?: string;
  currencyCode?: string;
}

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

  async create(data: CreateCountryDTO) {
    return prisma.country.create({
      data,
    });
  }

  async update(id: string, data: Partial<CreateCountryDTO>) {
    return prisma.country.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return prisma.country.delete({
      where: {
        id,
      },
    });
  }
}