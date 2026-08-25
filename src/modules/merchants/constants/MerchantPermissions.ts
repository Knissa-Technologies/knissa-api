import { MerchantRole } from "@prisma/client";

export const MerchantPermissions = {
  VIEW_MERCHANT: [
    MerchantRole.OWNER,
    MerchantRole.ADMIN,
    MerchantRole.MANAGER,
  ],

  MANAGE_MEMBERS: [
    MerchantRole.OWNER,
    MerchantRole.ADMIN,
  ],

  MANAGE_SETTINGS: [
    MerchantRole.OWNER,
    MerchantRole.ADMIN,
  ],

  UPDATE_MERCHANT: [
    MerchantRole.OWNER,
  ],

  MANAGE_ROLES: [
    MerchantRole.OWNER,
  ],
} as const;