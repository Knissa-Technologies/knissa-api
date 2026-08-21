import { prisma } from "../../../infra/database/prisma.js";
import { ExchangeRateProvider } from "@prisma/client";

export class ExchangeRatesRepository {
  // ======================================================
  // FIND CURRENCY BY ID
  // ======================================================

  async findCurrencyById(currencyId: string) {
    return prisma.currency.findUnique({
      where: {
        id: currencyId,
      },
      select: {
        id: true,
        code: true,
        name: true,
        decimals: true,
        isActive: true,
      },
    });
  }

  // ======================================================
  // FIND ALL EXCHANGE RATES
  // ======================================================

  async findAll() {
    return prisma.exchangeRate.findMany({
      orderBy: {
        validFrom: "desc",
      },

      select: {
        id: true,
        rateNumber: true,

        baseCurrencyId: true,
        quoteCurrencyId: true,

        rate: true,
        provider: true,

        validFrom: true,
        validUntil: true,

        createdAt: true,
        updatedAt: true,

        baseCurrency: {
          select: {
            id: true,
            code: true,
            name: true,
            decimals: true,
          },
        },

        quoteCurrency: {
          select: {
            id: true,
            code: true,
            name: true,
            decimals: true,
          },
        },
      },
    });
  }

  // ======================================================
  // FIND EXCHANGE RATE BY ID
  // ======================================================

  async findById(rateId: string) {
    return prisma.exchangeRate.findUnique({
      where: {
        id: rateId,
      },

      select: {
        id: true,
        rateNumber: true,

        baseCurrencyId: true,
        quoteCurrencyId: true,

        rate: true,
        provider: true,

        validFrom: true,
        validUntil: true,

        createdAt: true,
        updatedAt: true,

        baseCurrency: {
          select: {
            id: true,
            code: true,
            name: true,
            decimals: true,
          },
        },

        quoteCurrency: {
          select: {
            id: true,
            code: true,
            name: true,
            decimals: true,
          },
        },
      },
    });
  }

  // ======================================================
  // CREATE EXCHANGE RATE
  // ======================================================

  async create(data: {
    rateNumber: string;

    baseCurrencyId: string;
    quoteCurrencyId: string;

    rate: string;

    provider: ExchangeRateProvider;

    validFrom: Date;
    validUntil?: Date | null;
  }) {
    return prisma.exchangeRate.create({
      data: {
        rateNumber: data.rateNumber,

        baseCurrencyId: data.baseCurrencyId,
        quoteCurrencyId: data.quoteCurrencyId,

        rate: data.rate,

        provider: data.provider,

        validFrom: data.validFrom,
        validUntil: data.validUntil,
      },

      select: {
        id: true,
        rateNumber: true,

        baseCurrencyId: true,
        quoteCurrencyId: true,

        rate: true,
        provider: true,

        validFrom: true,
        validUntil: true,

        createdAt: true,
        updatedAt: true,

        baseCurrency: {
          select: {
            code: true,
          },
        },

        quoteCurrency: {
          select: {
            code: true,
          },
        },
      },
    });
  }

  // ======================================================
  // UPDATE EXCHANGE RATE
  // ======================================================

  async update(
    rateId: string,
    data: {
      rate?: string;

      provider?: ExchangeRateProvider;

      validFrom?: Date;

      validUntil?: Date | null;
    },
  ) {
    return prisma.exchangeRate.update({
      where: {
        id: rateId,
      },

      data: {
        rate: data.rate,

        provider: data.provider,

        validFrom: data.validFrom,

        validUntil: data.validUntil,
      },

      select: {
        id: true,
        rateNumber: true,

        baseCurrencyId: true,
        quoteCurrencyId: true,

        rate: true,
        provider: true,

        validFrom: true,
        validUntil: true,

        createdAt: true,
        updatedAt: true,

        baseCurrency: {
          select: {
            id: true,
            code: true,
            name: true,
            decimals: true,
          },
        },

        quoteCurrency: {
          select: {
            id: true,
            code: true,
            name: true,
            decimals: true,
          },
        },
      },
    });
  }

  // ======================================================
  // EXPIRE EXCHANGE RATE
  // ======================================================

  async expire(rateId: string) {
    return prisma.exchangeRate.update({
      where: {
        id: rateId,
      },

      data: {
        validUntil: new Date(),
      },

      select: {
        id: true,
        rateNumber: true,

        rate: true,
        provider: true,

        validFrom: true,
        validUntil: true,

        updatedAt: true,

        baseCurrency: {
          select: {
            code: true,
          },
        },

        quoteCurrency: {
          select: {
            code: true,
          },
        },
      },
    });
  }

  // ======================================================
  // EXPIRE PREVIOUS ACTIVE RATES
  // ======================================================

  async expireActiveRates(baseCurrencyId: string, quoteCurrencyId: string) {
    const now = new Date();

    return prisma.exchangeRate.updateMany({
      where: {
        baseCurrencyId,
        quoteCurrencyId,

        validUntil: null,
      },

      data: {
        validUntil: now,
      },
    });
  }
}
