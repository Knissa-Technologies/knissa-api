import { prisma } from "../../../infra/database/prisma.js";

import { BadRequestError } from "../../../shared/errors/BadRequestError.js";

export class ExchangeRepository {
  // ======================================================
  // ACCOUNT
  // ======================================================

  async findAccountByUserId(userId: string) {
    return prisma.account.findFirst({
      where: {
        profile: {
          userId,
        },
      },
      select: {
        id: true,
        profileId: true,
        status: true,
      },
    });
  }

  // ======================================================
  // WALLET
  // ======================================================

  async findWalletById(walletId: string) {
    return prisma.wallet.findUnique({
      where: {
        id: walletId,
      },

      select: {
        id: true,
        walletNumber: true,
        accountId: true,
        currencyId: true,
        status: true,

        availableBalance: true,
        reservedBalance: true,
        totalBalance: true,

        currency: {
          select: {
            id: true,
            code: true,
            decimals: true,
            isActive: true,
          },
        },
      },
    });
  }

  // ======================================================
  // FIND ACTIVE EXCHANGE RATE
  // ======================================================

  async findActiveExchangeRate(
    baseCurrencyId: string,
    quoteCurrencyId: string,
  ) {
    const now = new Date();

    return prisma.exchangeRate.findFirst({
      where: {
        baseCurrencyId,
        quoteCurrencyId,

        validFrom: {
          lte: now,
        },

        OR: [
          {
            validUntil: null,
          },
          {
            validUntil: {
              gt: now,
            },
          },
        ],
      },

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
      },
    });
  }

  // ======================================================
  // CREATE EXCHANGE QUOTE
  // ======================================================

  async createQuote(data: {
    quoteNumber: string;

    accountId: string;
    exchangeRateId: string;

    sourceWalletId: string;
    destinationWalletId: string;

    sourceAmount: string;
    destinationAmount: string;

    exchangeFee: string;

    expiresAt: Date;
  }) {
    return prisma.exchangeQuote.create({
      data: {
        quoteNumber: data.quoteNumber,

        accountId: data.accountId,
        exchangeRateId: data.exchangeRateId,

        sourceWalletId: data.sourceWalletId,
        destinationWalletId: data.destinationWalletId,

        sourceAmount: data.sourceAmount,
        destinationAmount: data.destinationAmount,

        exchangeFee: data.exchangeFee,

        status: "ACTIVE",

        expiresAt: data.expiresAt,
      },

      select: {
        id: true,
        quoteNumber: true,

        accountId: true,
        exchangeRateId: true,

        sourceWalletId: true,
        destinationWalletId: true,

        sourceAmount: true,
        destinationAmount: true,

        exchangeFee: true,

        status: true,

        expiresAt: true,
        acceptedAt: true,

        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // ======================================================
  // FIND EXCHANGE QUOTE
  // ======================================================

  async findQuoteById(quoteId: string) {
    return prisma.exchangeQuote.findUnique({
      where: {
        id: quoteId,
      },

      include: {
        exchangeRate: true,

        sourceWallet: {
          include: {
            currency: true,
          },
        },

        destinationWallet: {
          include: {
            currency: true,
          },
        },
      },
    });
  }

  // ======================================================
  // EXECUTE EXCHANGE
  // ======================================================

  async executeExchange(data: {
    exchangeNumber: string;
    transactionNumber: string;

    quoteId: string;
    exchangeRateId: string;

    sourceWalletId: string;
    destinationWalletId: string;

    sourceCurrencyId: string;
    destinationCurrencyId: string;

    sourceAmount: string;
    destinationAmount: string;

    exchangeFee: string;

    sourceLedgerNumber: string;
    destinationLedgerNumber: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // ==================================================
      // LOCK / CLAIM EXCHANGE QUOTE
      // ==================================================

      const quoteUpdated = await tx.exchangeQuote.updateMany({
        where: {
          id: data.quoteId,
          status: "ACTIVE",
          expiresAt: {
            gt: new Date(),
          },
        },

        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });

      if (quoteUpdated.count !== 1) {
        throw new BadRequestError(
          "Exchange quote is no longer active or has expired.",
        );
      }

      // ==================================================
      // CREATE TRANSACTION
      // ==================================================

      const transaction = await tx.transaction.create({
        data: {
          transactionNumber: data.transactionNumber,

          sourceWalletId: data.sourceWalletId,
          destinationWalletId: data.destinationWalletId,

          currencyId: data.sourceCurrencyId,

          type: "EXCHANGE",
          status: "PROCESSING",

          amount: data.sourceAmount,

          feeAmount: data.exchangeFee,

          netAmount: data.sourceAmount,

          description: "Currency exchange.",
        },
      });

      // ==================================================
      // DEBIT SOURCE WALLET
      // ==================================================

      const sourceUpdated = await tx.wallet.updateMany({
        where: {
          id: data.sourceWalletId,

          status: "ACTIVE",

          availableBalance: {
            gte: data.sourceAmount,
          },
        },

        data: {
          availableBalance: {
            decrement: data.sourceAmount,
          },

          totalBalance: {
            decrement: data.sourceAmount,
          },
        },
      });

      if (sourceUpdated.count !== 1) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      // ==================================================
      // CREDIT DESTINATION WALLET
      // ==================================================

      await tx.wallet.update({
        where: {
          id: data.destinationWalletId,

          status: "ACTIVE",
        },

        data: {
          availableBalance: {
            increment: data.destinationAmount,
          },

          totalBalance: {
            increment: data.destinationAmount,
          },
        },
      });

      // ==================================================
      // GET UPDATED WALLETS
      // ==================================================

      const sourceWallet = await tx.wallet.findUniqueOrThrow({
        where: {
          id: data.sourceWalletId,
        },
      });

      const destinationWallet = await tx.wallet.findUniqueOrThrow({
        where: {
          id: data.destinationWalletId,
        },
      });

      // ==================================================
      // SOURCE LEDGER ENTRY
      // ==================================================

      await tx.ledgerEntry.create({
        data: {
          entryNumber: data.sourceLedgerNumber,

          walletId: data.sourceWalletId,

          transactionId: transaction.id,

          currencyId: data.sourceCurrencyId,

          entryType: "DEBIT",

          amount: data.sourceAmount,

          balanceAfter: sourceWallet.totalBalance,

          description: "Currency exchange debit.",
        },
      });

      // ==================================================
      // DESTINATION LEDGER ENTRY
      // ==================================================

      await tx.ledgerEntry.create({
        data: {
          entryNumber: data.destinationLedgerNumber,

          walletId: data.destinationWalletId,

          transactionId: transaction.id,

          currencyId: data.destinationCurrencyId,

          entryType: "CREDIT",

          amount: data.destinationAmount,

          balanceAfter: destinationWallet.totalBalance,

          description: "Currency exchange credit.",
        },
      });

      // ==================================================
      // CREATE EXCHANGE
      // ==================================================

      const exchange = await tx.exchange.create({
        data: {
          exchangeNumber: data.exchangeNumber,

          transactionId: transaction.id,

          exchangeRateId: data.exchangeRateId,

          quoteId: data.quoteId,

          sourceWalletId: data.sourceWalletId,

          destinationWalletId: data.destinationWalletId,

          sourceAmount: data.sourceAmount,

          destinationAmount: data.destinationAmount,

          exchangeFee: data.exchangeFee,

          status: "COMPLETED",

          completedAt: new Date(),
        },
      });

      // ==================================================
      // COMPLETE TRANSACTION
      // ==================================================

      await tx.transaction.update({
        where: {
          id: transaction.id,
        },

        data: {
          status: "COMPLETED",

          completedAt: new Date(),
        },
      });

      // ==================================================
      // RETURN EXCHANGE
      // ==================================================

      return exchange;
    });
  }

  // ======================================================
  // FIND EXCHANGES BY ACCOUNT
  // ======================================================

  async findExchangesByAccountId(accountId: string) {
    return prisma.exchange.findMany({
      where: {
        transaction: {
          OR: [
            {
              sourceWallet: {
                accountId,
              },
            },
            {
              destinationWallet: {
                accountId,
              },
            },
          ],
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        exchangeNumber: true,

        transactionId: true,
        exchangeRateId: true,
        quoteId: true,

        sourceWalletId: true,
        destinationWalletId: true,

        sourceAmount: true,
        destinationAmount: true,
        exchangeFee: true,

        status: true,

        completedAt: true,

        createdAt: true,
        updatedAt: true,

        sourceWallet: {
          select: {
            id: true,
            walletNumber: true,

            currency: {
              select: {
                code: true,
              },
            },
          },
        },

        destinationWallet: {
          select: {
            id: true,
            walletNumber: true,

            currency: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });
  }

  // ======================================================
  // FIND EXCHANGE BY ID AND ACCOUNT
  // ======================================================

  async findExchangeByIdAndAccountId(exchangeId: string, accountId: string) {
    return prisma.exchange.findFirst({
      where: {
        id: exchangeId,

        transaction: {
          OR: [
            {
              sourceWallet: {
                accountId,
              },
            },
            {
              destinationWallet: {
                accountId,
              },
            },
          ],
        },
      },

      select: {
        id: true,
        exchangeNumber: true,

        transactionId: true,
        exchangeRateId: true,
        quoteId: true,

        sourceWalletId: true,
        destinationWalletId: true,

        sourceAmount: true,
        destinationAmount: true,
        exchangeFee: true,

        status: true,

        completedAt: true,

        createdAt: true,
        updatedAt: true,

        sourceWallet: {
          select: {
            id: true,
            walletNumber: true,

            currency: {
              select: {
                code: true,
              },
            },
          },
        },

        destinationWallet: {
          select: {
            id: true,
            walletNumber: true,

            currency: {
              select: {
                code: true,
              },
            },
          },
        },

        exchangeRate: {
          select: {
            id: true,
            rateNumber: true,
            rate: true,
            provider: true,
          },
        },
      },
    });
  }

  // ======================================================
  // FIND QUOTES BY ACCOUNT
  // ======================================================

  async findQuotesByAccountId(accountId: string) {
    return prisma.exchangeQuote.findMany({
      where: {
        accountId,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        quoteNumber: true,

        exchangeRateId: true,

        sourceWalletId: true,
        destinationWalletId: true,

        sourceAmount: true,
        destinationAmount: true,

        exchangeFee: true,

        status: true,

        expiresAt: true,
        acceptedAt: true,

        createdAt: true,
        updatedAt: true,

        sourceWallet: {
          select: {
            walletNumber: true,

            currency: {
              select: {
                code: true,
              },
            },
          },
        },

        destinationWallet: {
          select: {
            walletNumber: true,

            currency: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });
  }

  // ======================================================
  // FIND QUOTE BY ID AND ACCOUNT
  // ======================================================

  async findQuoteByIdAndAccountId(quoteId: string, accountId: string) {
    return prisma.exchangeQuote.findFirst({
      where: {
        id: quoteId,
        accountId,
      },

      select: {
        id: true,
        quoteNumber: true,

        accountId: true,
        exchangeRateId: true,

        sourceWalletId: true,
        destinationWalletId: true,

        sourceAmount: true,
        destinationAmount: true,

        exchangeFee: true,

        status: true,

        expiresAt: true,
        acceptedAt: true,

        createdAt: true,
        updatedAt: true,

        sourceWallet: {
          select: {
            id: true,
            walletNumber: true,

            currency: {
              select: {
                code: true,
              },
            },
          },
        },

        destinationWallet: {
          select: {
            id: true,
            walletNumber: true,

            currency: {
              select: {
                code: true,
              },
            },
          },
        },

        exchangeRate: {
          select: {
            id: true,
            rateNumber: true,
            rate: true,
            provider: true,
          },
        },
      },
    });
  }

  // ======================================================
  // FIND ALL EXCHANGES BY USER
  // ======================================================

  async findAllByUserId(userId: string) {
    return prisma.exchange.findMany({
      where: {
        sourceWallet: {
          account: {
            profile: {
              userId,
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        exchangeNumber: true,

        transactionId: true,
        exchangeRateId: true,
        quoteId: true,

        sourceWalletId: true,
        destinationWalletId: true,

        sourceAmount: true,
        destinationAmount: true,
        exchangeFee: true,

        status: true,

        completedAt: true,

        createdAt: true,
        updatedAt: true,

        // ================================================
        // SOURCE WALLET
        // ================================================

        sourceWallet: {
          select: {
            walletNumber: true,

            currency: {
              select: {
                code: true,
              },
            },
          },
        },

        // ================================================
        // DESTINATION WALLET
        // ================================================

        destinationWallet: {
          select: {
            walletNumber: true,

            currency: {
              select: {
                code: true,
              },
            },
          },
        },

        // ================================================
        // EXCHANGE RATE
        // ================================================

        exchangeRate: {
          select: {
            rateNumber: true,
            rate: true,
            provider: true,
          },
        },

        // ================================================
        // TRANSACTION
        // ================================================

        transaction: {
          select: {
            transactionNumber: true,
            status: true,
            completedAt: true,
          },
        },
      },
    });
  }

  // ======================================================
  // FIND EXCHANGE BY ID
  // ======================================================

  async findByIdAndUserId(exchangeId: string, userId: string) {
    return prisma.exchange.findFirst({
      where: {
        id: exchangeId,

        sourceWallet: {
          account: {
            profile: {
              userId,
            },
          },
        },
      },

      select: {
        id: true,
        exchangeNumber: true,

        transactionId: true,
        exchangeRateId: true,
        quoteId: true,

        sourceWalletId: true,
        destinationWalletId: true,

        sourceAmount: true,
        destinationAmount: true,
        exchangeFee: true,

        status: true,

        completedAt: true,

        createdAt: true,
        updatedAt: true,

        sourceWallet: {
          select: {
            id: true,
            walletNumber: true,

            currency: {
              select: {
                id: true,
                code: true,
                decimals: true,
              },
            },
          },
        },

        destinationWallet: {
          select: {
            id: true,
            walletNumber: true,

            currency: {
              select: {
                id: true,
                code: true,
                decimals: true,
              },
            },
          },
        },

        exchangeRate: {
          select: {
            id: true,
            rateNumber: true,
            rate: true,
            provider: true,
          },
        },

        transaction: {
          select: {
            id: true,
            transactionNumber: true,
            status: true,
            completedAt: true,
          },
        },
      },
    });
  }
}
