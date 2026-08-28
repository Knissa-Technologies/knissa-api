export interface CreateApiKeyDTO {
  accountId: string;
  name: string;
  expiresAt?: Date;
}
