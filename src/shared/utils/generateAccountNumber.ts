import { randomUUID } from "crypto";

export function generateAccountNumber(): string {
  return `ACC-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)
    .toUpperCase()}`;
}