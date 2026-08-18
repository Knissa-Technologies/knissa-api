export interface CreatePaymentDTO {
  accountId: string;
  merchantId: string;

  type: "PURCHASE";
  method: "WALLET";

  amount: string;

  idempotencyKey: string;

  description?: string;
  externalReference?: string;
}
