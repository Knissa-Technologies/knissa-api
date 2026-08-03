import { prisma } from "../../../infra/database/prisma.js";

export class RecipientRepository {
  async search(query: string) {
    return prisma.wallet.findMany({
      where: {
        OR: [
          {
            accountNumber: {
              contains: query,
            },
          },

          {
            user: {
              profile: {
                fullName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },

      take: 10,

      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }
}
