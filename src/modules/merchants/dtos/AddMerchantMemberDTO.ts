import type { MerchantRole } from "@prisma/client";

export interface AddMerchantMemberDTO {
  accountId: string;
  role: MerchantRole;
}