import type { MerchantType } from "@prisma/client";

export interface CreateMerchantDTO {
  legalName: string;
  tradeName?: string;
  merchantType: MerchantType;
  website?: string;
  supportEmail?: string;
  supportPhone?: string;
}