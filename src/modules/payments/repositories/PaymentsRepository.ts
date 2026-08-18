import { prisma } from "../../../infra/database/prisma.js";

const paymentSelect = {
  id: true,
  paymentNumber: true,

  accountId: true,
  transactionId: true,
  merchantId: true,

  type: true,
  method: true,
  status: true,

  description: true,
  externalReference: true,

  amount: true,
  feeAmount: true,
  totalAmount: true,

  completedAt: true,
  cancelledAt: true,

  createdAt: true,
  updatedAt: true,
} as const;

export class PaymentsRepository {
  // ======================================================
  // PROFILE
  // ======================================================

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

  // ======================================================
  // MERCHANT
  // ======================================================

  async findMerchantById(merchantId: string) {
    return prisma.merchant.findUnique({
      where: {
        id: merchantId,
      },
      select: {
        id: true,
        accountId: true,
        status: true,
      },
    });
  }

  // ======================================================
  // ACCOUNT
  // ======================================================

  async findAccountById(accountId: string) {
    return prisma.account.findUnique({
      where: {
        id: accountId,
      },
      select: {
        id: true,
        accountNumber: true,
        profileId: true,
        status: true,
      },
    });
  }

  // ======================================================
  // WALLET
  // ======================================================

  async findWalletByAccountAndCurrency(
    accountId: string,
    currencyId: string,
  ) {
    return prisma.wallet.findUnique({
      where: {
        accountId_currencyId: {
          accountId,
          currencyId,
        },
      },
      select: {
        id: true,
        accountId: true,
        currencyId: true,
        status: true,
        availableBalance: true,
        totalBalance: true,
      },
    });
  }

  async findWalletsByAccountId(accountId: string) {
    return prisma.wallet.findMany({
      where: {
        accountId,
      },
      select: {
        id: true,
        accountId: true,
        currencyId: true,
        status: true,
        availableBalance: true,
        totalBalance: true,
      },
      orderBy: {
        isDefault: "desc",
      },
    });
  }

  // ======================================================
  // IDEMPOTENCY
  // ======================================================

  async findByIdempotencyKey(idempotencyKey: string) {
    return prisma.payment.findFirst({
      where: {
        transaction: {
          idempotencyKey,
        },
      },
      select: paymentSelect,
    });
  }

  // ======================================================
  // LIST PAYMENTS BY PROFILE
  // ======================================================

  async findPaymentsByProfileId(profileId: string) {
    return prisma.payment.findMany({
      where: {
        account: {
          profileId,
        },
      },
      select: paymentSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // ======================================================
  // FIND PAYMENT BY ID
  // ======================================================

  async findPaymentById(paymentId: string) {
    return prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      select: paymentSelect,
    });
  }

  // ======================================================
  // PAYMENT FOR REFUND
  // ======================================================

  async findPaymentForRefund(paymentId: string) {
    return prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      select: {
        ...paymentSelect,

        transaction: {
          select: {
            id: true,
            transactionNumber: true,

            sourceWalletId: true,
            destinationWalletId: true,

            currencyId: true,

            type: true,
            status: true,

            amount: true,
            feeAmount: true,
            netAmount: true,

            description: true,
            externalReference: true,

            idempotencyKey: true,
          },
        },
      },
    });
  }

  // ======================================================
  // CREATE PAYMENT
  // ======================================================

  async pay(data: {
    paymentNumber: string;
    accountId: string;
    merchantId: string;

    sourceWalletId: string;
    destinationWalletId: string;

    currencyId: string;
    amount: string;

    idempotencyKey: string;

    description?: string;
    externalReference?: string;

    transactionNumber: string;
    sourceLedgerNumber: string;
    destinationLedgerNumber: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // ====================================================
      // TRANSACTION
      // ====================================================

      const transaction = await tx.transaction.create({
        data: {
          transactionNumber: data.transactionNumber,

          sourceWalletId: data.sourceWalletId,
          destinationWalletId: data.destinationWalletId,

          currencyId: data.currencyId,

          type: "PAYMENT",
          status: "PROCESSING",

          amount: data.amount,
          feeAmount: "0",
          netAmount: data.amount,

          idempotencyKey: data.idempotencyKey,

          description: data.description,
          externalReference: data.externalReference,
        },
      });

      // ====================================================
      // DEBIT SOURCE WALLET
      // ====================================================

      const sourceUpdated = await tx.wallet.updateMany({
        where: {
          id: data.sourceWalletId,
          status: "ACTIVE",
          currencyId: data.currencyId,

          availableBalance: {
            gte: data.amount,
          },
        },

        data: {
          availableBalance: {
            decrement: data.amount,
          },

          totalBalance: {
            decrement: data.amount,
          },
        },
      });

      if (sourceUpdated.count !== 1) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      // ====================================================
      // CREDIT DESTINATION WALLET
      // ====================================================

      const destinationUpdated = await tx.wallet.updateMany({
        where: {
          id: data.destinationWalletId,
          status: "ACTIVE",
          currencyId: data.currencyId,
        },

        data: {
          availableBalance: {
            increment: data.amount,
          },

          totalBalance: {
            increment: data.amount,
          },
        },
      });

      if (destinationUpdated.count !== 1) {
        throw new Error("MERCHANT_WALLET_UNAVAILABLE");
      }

      // ====================================================
      // GET UPDATED WALLETS
      // ====================================================

      const sourceWallet = await tx.wallet.findUniqueOrThrow({
        where: {
          id: data.sourceWalletId,
        },
      });

      const destinationWallet =
        await tx.wallet.findUniqueOrThrow({
          where: {
            id: data.destinationWalletId,
          },
        });

      // ====================================================
      // SOURCE LEDGER
      // ====================================================

      await tx.ledgerEntry.create({
        data: {
          entryNumber: data.sourceLedgerNumber,

          walletId: data.sourceWalletId,

          transactionId: transaction.id,

          currencyId: data.currencyId,

          entryType: "DEBIT",

          amount: data.amount,

          balanceAfter: sourceWallet.totalBalance,

          description:
            data.description ?? "Payment sent.",
        },
      });

      // ====================================================
      // DESTINATION LEDGER
      // ====================================================

      await tx.ledgerEntry.create({
        data: {
          entryNumber: data.destinationLedgerNumber,

          walletId: data.destinationWalletId,

          transactionId: transaction.id,

          currencyId: data.currencyId,

          entryType: "CREDIT",

          amount: data.amount,

          balanceAfter:
            destinationWallet.totalBalance,

          description:
            data.description ?? "Payment received.",
        },
      });

      // ====================================================
      // PAYMENT
      // ====================================================

      const payment = await tx.payment.create({
        data: {
          paymentNumber: data.paymentNumber,

          accountId: data.accountId,
          merchantId: data.merchantId,

          transactionId: transaction.id,

          type: "PURCHASE",
          method: "WALLET",

          status: "COMPLETED",

          description: data.description,
          externalReference: data.externalReference,

          amount: data.amount,
          feeAmount: "0",
          totalAmount: data.amount,

          completedAt: new Date(),
        },

        select: paymentSelect,
      });

      // ====================================================
      // COMPLETE TRANSACTION
      // ====================================================

      await tx.transaction.update({
        where: {
          id: transaction.id,
        },

        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      return payment;
    });
  }

  // ======================================================
  // REFUND PAYMENT
  // ======================================================

  async refund(data: {
    paymentId: string;

    idempotencyKey: string;

    transactionNumber: string;

    sourceWalletId: string;
    destinationWalletId: string;

    currencyId: string;
    amount: string;

    description?: string;

    sourceLedgerNumber: string;
    destinationLedgerNumber: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // ====================================================
      // MARK ORIGINAL PAYMENT AS REFUNDED
      // ====================================================

      const paymentUpdated =
        await tx.payment.updateMany({
          where: {
            id: data.paymentId,
            status: "COMPLETED",
          },

          data: {
            status: "REFUNDED",
          },
        });

      if (paymentUpdated.count !== 1) {
        throw new Error("PAYMENT_ALREADY_REFUNDED");
      }

      // ====================================================
      // CREATE REFUND TRANSACTION
      // ====================================================

      const transaction =
        await tx.transaction.create({
          data: {
            transactionNumber:
              data.transactionNumber,

            // Merchant wallet → Customer wallet
            sourceWalletId:
              data.sourceWalletId,

            destinationWalletId:
              data.destinationWalletId,

            currencyId: data.currencyId,

            type: "REFUND",
            status: "PROCESSING",

            amount: data.amount,
            feeAmount: "0",
            netAmount: data.amount,

            idempotencyKey:
              data.idempotencyKey,

            description:
              data.description ??
              "Payment refund.",
          },
        });

      // ====================================================
      // DEBIT MERCHANT WALLET
      // ====================================================

      const sourceUpdated =
        await tx.wallet.updateMany({
          where: {
            id: data.sourceWalletId,
            status: "ACTIVE",
            currencyId: data.currencyId,

            availableBalance: {
              gte: data.amount,
            },
          },

          data: {
            availableBalance: {
              decrement: data.amount,
            },

            totalBalance: {
              decrement: data.amount,
            },
          },
        });

      if (sourceUpdated.count !== 1) {
        throw new Error(
          "MERCHANT_INSUFFICIENT_BALANCE",
        );
      }

      // ====================================================
      // CREDIT CUSTOMER WALLET
      // ====================================================

      const destinationUpdated =
        await tx.wallet.updateMany({
          where: {
            id: data.destinationWalletId,
            status: "ACTIVE",
            currencyId: data.currencyId,
          },

          data: {
            availableBalance: {
              increment: data.amount,
            },

            totalBalance: {
              increment: data.amount,
            },
          },
        });

      if (destinationUpdated.count !== 1) {
        throw new Error(
          "CUSTOMER_WALLET_UNAVAILABLE",
        );
      }

      // ====================================================
      // GET UPDATED WALLETS
      // ====================================================

      const sourceWallet =
        await tx.wallet.findUniqueOrThrow({
          where: {
            id: data.sourceWalletId,
          },
        });

      const destinationWallet =
        await tx.wallet.findUniqueOrThrow({
          where: {
            id: data.destinationWalletId,
          },
        });

      // ====================================================
      // MERCHANT REFUND LEDGER
      // ====================================================

      await tx.ledgerEntry.create({
        data: {
          entryNumber:
            data.sourceLedgerNumber,

          walletId: data.sourceWalletId,

          transactionId: transaction.id,

          currencyId: data.currencyId,

          entryType: "DEBIT",

          amount: data.amount,

          balanceAfter:
            sourceWallet.totalBalance,

          description:
            data.description ??
            "Payment refund sent.",
        },
      });

      // ====================================================
      // CUSTOMER REFUND LEDGER
      // ====================================================

      await tx.ledgerEntry.create({
        data: {
          entryNumber:
            data.destinationLedgerNumber,

          walletId:
            data.destinationWalletId,

          transactionId: transaction.id,

          currencyId: data.currencyId,

          entryType: "CREDIT",

          amount: data.amount,

          balanceAfter:
            destinationWallet.totalBalance,

          description:
            data.description ??
            "Payment refund received.",
        },
      });

      // ====================================================
      // COMPLETE REFUND TRANSACTION
      // ====================================================

      await tx.transaction.update({
        where: {
          id: transaction.id,
        },

        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // ====================================================
      // RETURN UPDATED PAYMENT
      // ====================================================

      return tx.payment.findUniqueOrThrow({
        where: {
          id: data.paymentId,
        },

        select: paymentSelect,
      });
    });
  }
}