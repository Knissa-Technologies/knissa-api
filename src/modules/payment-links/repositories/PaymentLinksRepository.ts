import { prisma } from "../../../infra/database/prisma.js";

const paymentLinkSelect = {
  id: true,
  paymentLinkNumber: true,

  merchantId: true,
  currencyId: true,

  amount: true,

  description: true,
  externalReference: true,

  status: true,

  expiresAt: true,

  maxUses: true,
  usedCount: true,

  createdAt: true,
  updatedAt: true,
} as const;

export class PaymentLinksRepository {
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

        settings: {
          select: {
            allowPaymentLinks: true,
          },
        },
      },
    });
  }

  // ======================================================
  // CURRENCY
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
        symbol: true,
        decimals: true,
        isActive: true,
      },
    });
  }

  // ======================================================
  // CREATE PAYMENT LINK
  // ======================================================

  async create(data: {
    paymentLinkNumber: string;

    merchantId: string;
    currencyId: string;

    amount: string;

    description?: string;
    externalReference?: string;

    expiresAt?: Date;
    maxUses?: number;
  }) {
    return prisma.paymentLink.create({
      data: {
        paymentLinkNumber: data.paymentLinkNumber,

        merchantId: data.merchantId,
        currencyId: data.currencyId,

        amount: data.amount,

        description: data.description,
        externalReference: data.externalReference,

        status: "ACTIVE",

        expiresAt: data.expiresAt,

        maxUses: data.maxUses,
        usedCount: 0,
      },

      select: paymentLinkSelect,
    });
  }

  // ======================================================
  // FIND PAYMENT LINK BY ID
  // ======================================================

  async findById(paymentLinkId: string) {
    return prisma.paymentLink.findUnique({
      where: {
        id: paymentLinkId,
      },
      select: {
        id: true,
        paymentLinkNumber: true,

        merchantId: true,
        currencyId: true,

        amount: true,

        description: true,
        externalReference: true,

        status: true,

        expiresAt: true,

        maxUses: true,
        usedCount: true,

        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // ======================================================
  // CANCEL PAYMENT LINK
  // ======================================================

  async cancel(paymentLinkId: string) {
    return prisma.paymentLink.update({
      where: {
        id: paymentLinkId,
      },
      data: {
        status: "CANCELLED",
      },
      select: {
        id: true,
        paymentLinkNumber: true,

        merchantId: true,
        currencyId: true,

        amount: true,

        description: true,
        externalReference: true,

        status: true,

        expiresAt: true,

        maxUses: true,
        usedCount: true,

        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // ======================================================
  // FIND PAYMENT LINKS BY MERCHANT
  // ======================================================

  async findByMerchantId(merchantId: string) {
    return prisma.paymentLink.findMany({
      where: {
        merchantId,
      },
      select: paymentLinkSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // ======================================================
  // FIND PAYMENT LINK BY NUMBER
  // ======================================================

  async findByPaymentLinkNumber(paymentLinkNumber: string) {
    return prisma.paymentLink.findUnique({
      where: {
        paymentLinkNumber,
      },
      select: paymentLinkSelect,
    });
  }

  // ======================================================
  // ACCOUNT BY PROFILE
  // ======================================================

  async findAccountByProfileId(profileId: string) {
    return prisma.account.findFirst({
      where: {
        profileId,
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
  // MERCHANT BY ACCOUNT
  // ======================================================

  async findMerchantByAccountId(accountId: string) {
    return prisma.merchant.findUnique({
      where: {
        accountId,
      },
      select: {
        id: true,
        accountId: true,
        status: true,
      },
    });
  }

  // ======================================================
  // REGISTER PAYMENT
  // ======================================================

  async registerPayment(paymentLinkId: string, paymentId: string) {
    return prisma.$transaction(async (tx) => {
      const paymentLink = await tx.paymentLink.findUnique({
        where: {
          id: paymentLinkId,
        },
        select: {
          id: true,
          status: true,
          maxUses: true,
          usedCount: true,
        },
      });

      if (!paymentLink) {
        throw new Error("Payment link not found.");
      }

      const newUsedCount = paymentLink.usedCount + 1;

      const shouldMarkAsPaid =
        paymentLink.maxUses !== null && newUsedCount >= paymentLink.maxUses;

      const updatedPaymentLink = await tx.paymentLink.update({
        where: {
          id: paymentLinkId,
        },
        data: {
          usedCount: {
            increment: 1,
          },

          status: shouldMarkAsPaid ? "PAID" : paymentLink.status,
        },
        select: paymentLinkSelect,
      });

      const payment = await tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          paymentLinkId,
        },
        select: {
          id: true,
          paymentNumber: true,
          paymentLinkId: true,
        },
      });

      return {
        paymentLink: updatedPaymentLink,
        payment,
      };
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
        profileId: true,
        status: true,
      },
    });
  }
}
