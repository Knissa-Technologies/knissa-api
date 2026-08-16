export interface CreateDepositDTO {
  destinationWalletId: string;
  amount: string;
  description?: string;
  idempotencyKey: string;
}
