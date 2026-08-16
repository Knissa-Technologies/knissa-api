import { randomUUID } from "crypto";

export function generateTransactionNumber(): string {
  return `TXN-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)
    .toUpperCase()}`;
}
