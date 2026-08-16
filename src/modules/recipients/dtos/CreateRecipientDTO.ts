export interface CreateRecipientDTO {
  ownerAccountNumber: string;
  accountNumber: string;
  type: "PERSONAL" | "BUSINESS" | "MERCHANT";
  nickname?: string | null;
  avatarUrl?: string | null;
}
