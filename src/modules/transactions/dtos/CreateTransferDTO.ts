export interface CreateTransferDTO {
  sourceWalletId: string;
  destinationWalletId: string;
  amount: string;
  description?: string;
  idempotencyKey: string;
}

