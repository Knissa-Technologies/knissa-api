import { randomUUID } from "crypto";

export function generateLedgerEntryNumber(): string {
  return `LED-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)
    .toUpperCase()}`;
}
