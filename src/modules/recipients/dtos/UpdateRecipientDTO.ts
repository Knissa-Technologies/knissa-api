export interface UpdateRecipientDTO {
  nickname?: string | null;
  avatarUrl?: string | null;
  status?: "ACTIVE" | "BLOCKED";
}
