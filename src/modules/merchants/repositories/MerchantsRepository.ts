import {
  Merchant,
  MerchantMember,
  MerchantRole,
  MerchantSettings,
  Prisma,
} from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";

export class MerchantsRepository {
  // ======================================================
  // MERCHANT
  // ======================================================

  async findMerchantByAccountId(accountId: string): Promise<Merchant | null> {
    return prisma.merchant.findUnique({
      where: {
        accountId,
      },
    });
  }

  async findMerchantById(id: string): Promise<Merchant | null> {
    return prisma.merchant.findUnique({
      where: {
        id,
      },
    });
  }

  async createMerchant(
    data: Prisma.MerchantUncheckedCreateInput,
  ): Promise<Merchant> {
    return prisma.merchant.create({
      data,
    });
  }

  async updateMerchant(
    id: string,
    data: Prisma.MerchantUpdateInput,
  ): Promise<Merchant> {
    return prisma.merchant.update({
      where: {
        id,
      },
      data,
    });
  }

  // ======================================================
  // MERCHANT MEMBERS
  // ======================================================

  async createMember(
    data: Prisma.MerchantMemberUncheckedCreateInput,
  ): Promise<MerchantMember> {
    return prisma.merchantMember.create({
      data,
    });
  }

  async findMembersByMerchantId(merchantId: string) {
    return prisma.merchantMember.findMany({
      where: {
        merchantId,
      },
      include: {
        account: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findMemberById(id: string): Promise<MerchantMember | null> {
    return prisma.merchantMember.findUnique({
      where: {
        id,
      },
    });
  }

  async findMemberByMerchantAndAccount(
    merchantId: string,
    accountId: string,
  ): Promise<MerchantMember | null> {
    return prisma.merchantMember.findUnique({
      where: {
        merchantId_accountId: {
          merchantId,
          accountId,
        },
      },
    });
  }

  async updateMember(
    id: string,
    data: Prisma.MerchantMemberUpdateInput,
  ): Promise<MerchantMember> {
    return prisma.merchantMember.update({
      where: {
        id,
      },
      data,
    });
  }

  async deactivateMember(id: string): Promise<MerchantMember> {
    return prisma.merchantMember.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }

  // ======================================================
  // MERCHANT SETTINGS
  // ======================================================

  async findSettingsByMerchantId(
    merchantId: string,
  ): Promise<MerchantSettings | null> {
    return prisma.merchantSettings.findUnique({
      where: {
        merchantId,
      },
    });
  }

  async createSettings(
    data: Prisma.MerchantSettingsUncheckedCreateInput,
  ): Promise<MerchantSettings> {
    return prisma.merchantSettings.create({
      data,
    });
  }

  async updateSettings(
    merchantId: string,
    data: Prisma.MerchantSettingsUpdateInput,
  ): Promise<MerchantSettings> {
    return prisma.merchantSettings.update({
      where: {
        merchantId,
      },
      data,
    });
  }

  // ======================================================
  // COMPLETE MERCHANT
  // ======================================================

  async findMerchantCompleteByAccountId(accountId: string) {
    return prisma.merchant.findUnique({
      where: {
        accountId,
      },
      include: {
        settings: true,
        members: {
          include: {
            account: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });
  }

  async activateMember(memberId: string) {
    return prisma.merchantMember.update({
      where: {
        id: memberId,
      },
      data: {
        isActive: true,
      },
    });
  }

  async updateMemberRole(memberId: string, role: MerchantRole) {
    return prisma.merchantMember.update({
      where: {
        id: memberId,
      },
      data: {
        role,
      },
    });
  }

  // ======================================================
  // TRANSFER OWNERSHIP
  // ======================================================

  async transferOwnership(
    currentOwnerMemberId: string,
    newOwnerMemberId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.merchantMember.update({
        where: {
          id: currentOwnerMemberId,
        },
        data: {
          role: MerchantRole.ADMIN,
        },
      });

      return tx.merchantMember.update({
        where: {
          id: newOwnerMemberId,
        },
        data: {
          role: MerchantRole.OWNER,
        },
      });
    });
  }
}
