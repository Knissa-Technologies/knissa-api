import { randomUUID } from "crypto";

export function generateWalletNumber(): string {
  return `WAL-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)
    .toUpperCase()}`;
}