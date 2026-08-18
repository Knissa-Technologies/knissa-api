import { randomUUID } from "crypto";

export function generatePaymentNumber(): string {
  return `PAY-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)
    .toUpperCase()}`;
}
