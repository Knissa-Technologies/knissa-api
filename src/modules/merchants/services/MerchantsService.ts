import { MerchantRole, Prisma } from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";

import { MerchantsRepository } from "../repositories/MerchantsRepository.js";

import type { CreateMerchantDTO } from "../dtos/CreateMerchantDTO.js";
import type { UpdateMerchantDTO } from "../dtos/UpdateMerchantDTO.js";
import type { AddMerchantMemberDTO } from "../dtos/AddMerchantMemberDTO.js";
import type { UpdateMerchantSettingsDTO } from "../dtos/UpdateMerchantSettingsDTO.js";
import type { UpdateMerchantMemberRoleDTO } from "../dtos/UpdateMerchantMemberRoleDTO.js";

import { MerchantPermissions } from "../constants/MerchantPermissions.js";

export class MerchantsService {
  private readonly merchantsRepository = new MerchantsRepository();

  // ======================================================
  // ACCOUNT
  // ======================================================

  private async getAccountByUserId(userId: string) {
    const account = await prisma.account.findFirst({
      where: {
        profile: {
          userId,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!account) {
      throw new Error("Account not found.");
    }

    return account;
  }

  // ======================================================
  // MERCHANT
  // ======================================================

  private async getMerchantByUserId(userId: string) {
    const account = await this.getAccountByUserId(userId);

    const ownedMerchant =
      await this.merchantsRepository.findMerchantByAccountId(account.id);

    if (ownedMerchant) {
      return ownedMerchant;
    }

    const member = await prisma.merchantMember.findFirst({
      where: {
        accountId: account.id,
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!member) {
      throw new Error("Merchant not found.");
    }

    const merchant = await prisma.merchant.findUnique({
      where: {
        id: member.merchantId,
      },
    });

    if (!merchant) {
      throw new Error("Merchant not found.");
    }

    return merchant;
  }

  // ======================================================
  // CURRENT MERCHANT MEMBER
  // ======================================================

  private async getCurrentMerchantMember(userId: string) {
    const account = await this.getAccountByUserId(userId);

    const merchant = await this.getMerchantByUserId(userId);

    const member =
      await this.merchantsRepository.findMemberByMerchantAndAccount(
        merchant.id,
        account.id,
      );

    if (!member) {
      throw new Error("Merchant member not found.");
    }

    if (!member.isActive) {
      throw new Error("Merchant member is inactive.");
    }

    return {
      account,
      merchant,
      member,
    };
  }

  // ======================================================
  // AUTHORIZATION
  // ======================================================

  private async requireOwner(userId: string) {
    const context = await this.getCurrentMerchantMember(userId);

    if (context.member.role !== MerchantRole.OWNER) {
      throw new Error("Only the merchant owner can perform this action.");
    }

    return context;
  }

  private async requireRoles(
    userId: string,
    allowedRoles: readonly MerchantRole[],
  ) {
    const context = await this.getCurrentMerchantMember(userId);

    if (!allowedRoles.includes(context.member.role)) {
      throw new Error("You do not have permission to perform this action.");
    }

    return context;
  }

  // ======================================================
  // CREATE MERCHANT
  // ======================================================

  async createMerchant(userId: string, data: CreateMerchantDTO) {
    const account = await this.getAccountByUserId(userId);

    const existingMerchant =
      await this.merchantsRepository.findMerchantByAccountId(account.id);

    if (existingMerchant) {
      throw new Error("A merchant already exists for this account.");
    }

    const merchantNumber = `MRC-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase()}`;

    const merchantMemberNumber = `MBR-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase()}`;

    const merchantSettingsNumber = `MST-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase()}`;

    return prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.create({
        data: {
          merchantNumber,
          accountId: account.id,
          legalName: data.legalName,
          tradeName: data.tradeName,
          merchantType: data.merchantType,
          website: data.website,
          supportEmail: data.supportEmail,
          supportPhone: data.supportPhone,
        },
      });

      await tx.merchantMember.create({
        data: {
          merchantMemberNumber,
          merchantId: merchant.id,
          accountId: account.id,
          role: MerchantRole.OWNER,
        },
      });

      await tx.merchantSettings.create({
        data: {
          merchantSettingsNumber,
          merchantId: merchant.id,
          displayName: data.tradeName ?? data.legalName,
          websiteUrl: data.website,
          supportEmail: data.supportEmail,
          supportPhone: data.supportPhone,
        },
      });

      return merchant;
    });
  }

  // ======================================================
  // GET MY MERCHANT
  // ======================================================

  async getMyMerchant(userId: string) {
    const merchant = await this.getMerchantByUserId(userId);

    const completeMerchant = await prisma.merchant.findUnique({
      where: {
        id: merchant.id,
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

    if (!completeMerchant) {
      throw new Error("Merchant not found.");
    }

    return completeMerchant;
  }

  // ======================================================
  // UPDATE MY MERCHANT
  // OWNER ONLY
  // ======================================================

  async updateMyMerchant(userId: string, data: UpdateMerchantDTO) {
    const { merchant } = await this.requireOwner(userId);

    return this.merchantsRepository.updateMerchant(
      merchant.id,
      data as Prisma.MerchantUpdateInput,
    );
  }

  // ======================================================
  // GET MEMBERS
  // ======================================================

  async getMembers(userId: string) {
    const { merchant } = await this.requireRoles(
      userId,
      MerchantPermissions.VIEW_MERCHANT,
    );

    return this.merchantsRepository.findMembersByMerchantId(merchant.id);
  }

  // ======================================================
  // ADD MEMBER
  // ======================================================

  async addMember(userId: string, data: AddMerchantMemberDTO) {
    const {
      account,
      merchant,
      member: currentMember,
    } = await this.requireRoles(userId, MerchantPermissions.MANAGE_MEMBERS);

    if (data.role === MerchantRole.OWNER) {
      throw new Error(
        "A new merchant owner cannot be created through this endpoint.",
      );
    }

    if (
      currentMember.role === MerchantRole.ADMIN &&
      data.role === MerchantRole.ADMIN
    ) {
      throw new Error("An administrator cannot create another administrator.");
    }

    const accountExists = await prisma.account.findUnique({
      where: {
        id: data.accountId,
      },
    });

    if (!accountExists) {
      throw new Error("Account not found.");
    }

    const existingMember =
      await this.merchantsRepository.findMemberByMerchantAndAccount(
        merchant.id,
        data.accountId,
      );

    if (existingMember) {
      throw new Error("This account is already a member of the merchant.");
    }

    const merchantMemberNumber = `MBR-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase()}`;

    return this.merchantsRepository.createMember({
      merchantMemberNumber,
      merchantId: merchant.id,
      accountId: data.accountId,
      role: data.role,
      invitedByAccountId: account.id,
    });
  }

  // ======================================================
  // DEACTIVATE MEMBER
  // ======================================================

  async deactivateMember(userId: string, memberId: string) {
    const { merchant, member: currentMember } = await this.requireRoles(
      userId,
      MerchantPermissions.MANAGE_MEMBERS,
    );

    const targetMember =
      await this.merchantsRepository.findMemberById(memberId);

    if (!targetMember) {
      throw new Error("Merchant member not found.");
    }

    if (targetMember.merchantId !== merchant.id) {
      throw new Error("You do not have permission to modify this member.");
    }

    if (targetMember.role === MerchantRole.OWNER) {
      throw new Error("The merchant owner cannot be deactivated.");
    }

    if (
      currentMember.role === MerchantRole.ADMIN &&
      targetMember.role === MerchantRole.ADMIN
    ) {
      throw new Error(
        "An administrator cannot deactivate another administrator.",
      );
    }

    return this.merchantsRepository.deactivateMember(targetMember.id);
  }

  // ======================================================
  // ACTIVATE MEMBER
  // ======================================================

  async activateMember(userId: string, memberId: string) {
    const { merchant, member: currentMember } = await this.requireRoles(
      userId,
      [MerchantRole.OWNER, MerchantRole.ADMIN],
    );

    const targetMember =
      await this.merchantsRepository.findMemberById(memberId);

    if (!targetMember) {
      throw new Error("Merchant member not found.");
    }

    if (targetMember.merchantId !== merchant.id) {
      throw new Error("You do not have permission to modify this member.");
    }

    if (targetMember.role === MerchantRole.OWNER) {
      throw new Error(
        "The merchant owner cannot be activated through this endpoint.",
      );
    }

    if (
      currentMember.role === MerchantRole.ADMIN &&
      targetMember.role === MerchantRole.ADMIN
    ) {
      throw new Error(
        "An administrator cannot activate another administrator.",
      );
    }

    return this.merchantsRepository.activateMember(targetMember.id);
  }

  // ======================================================
  // UPDATE MEMBER ROLE
  // ======================================================

  async updateMemberRole(
    userId: string,
    memberId: string,
    data: UpdateMerchantMemberRoleDTO,
  ) {
    const { merchant, member: currentMember } = await this.requireRoles(
      userId,
      [MerchantRole.OWNER, MerchantRole.ADMIN],
    );

    const targetMember =
      await this.merchantsRepository.findMemberById(memberId);

    if (!targetMember) {
      throw new Error("Merchant member not found.");
    }

    if (targetMember.merchantId !== merchant.id) {
      throw new Error("You do not have permission to modify this member.");
    }

    if (targetMember.role === MerchantRole.OWNER) {
      throw new Error("The merchant owner's role cannot be changed.");
    }

    if (data.role === MerchantRole.OWNER) {
      throw new Error(
        "The merchant owner role cannot be assigned through this endpoint.",
      );
    }

    if (
      currentMember.role === MerchantRole.ADMIN &&
      targetMember.role === MerchantRole.ADMIN
    ) {
      throw new Error("An administrator cannot modify another administrator.");
    }

    if (
      currentMember.role === MerchantRole.ADMIN &&
      data.role === MerchantRole.ADMIN
    ) {
      throw new Error(
        "An administrator cannot promote a member to administrator.",
      );
    }

    return this.merchantsRepository.updateMemberRole(
      targetMember.id,
      data.role,
    );
  }

  // ======================================================
  // GET SETTINGS
  // ======================================================

  async getSettings(userId: string) {
    const merchant = await this.getMerchantByUserId(userId);

    const settings = await this.merchantsRepository.findSettingsByMerchantId(
      merchant.id,
    );

    if (!settings) {
      throw new Error("Merchant settings not found.");
    }

    return settings;
  }

  // ======================================================
  // UPDATE SETTINGS
  // ======================================================

  async updateSettings(userId: string, data: UpdateMerchantSettingsDTO) {
    const { merchant } = await this.requireRoles(
      userId,
      MerchantPermissions.MANAGE_SETTINGS,
    );

    return this.merchantsRepository.updateSettings(
      merchant.id,
      data as Prisma.MerchantSettingsUpdateInput,
    );
  }
}
