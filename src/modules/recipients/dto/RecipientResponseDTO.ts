export interface RecipientResponseDTO {
  id: string;

  displayName: string;

  accountNumber: string;

  walletType: string;

  verified: boolean;

  avatar?: string;
}
