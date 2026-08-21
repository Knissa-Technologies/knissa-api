export interface CreatePaymentLinkDTO {
  merchantId: string;
  currencyId: string;
  amount: string;
  description?: string;
  externalReference?: string;
  expiresAt?: string;
  maxUses?: number;
}
