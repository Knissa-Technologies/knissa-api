import { randomUUID } from "crypto";

export function generateRecipientNumber(): string {
  return `REC-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)
    .toUpperCase()}`;
}
