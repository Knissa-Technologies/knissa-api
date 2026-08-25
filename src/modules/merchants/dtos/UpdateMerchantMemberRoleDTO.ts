import { MerchantRole } from "@prisma/client";

export interface UpdateMerchantMemberRoleDTO {
  role: MerchantRole;
}