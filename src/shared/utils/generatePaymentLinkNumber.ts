import { randomBytes } from "node:crypto";

export function generatePaymentLinkNumber(): string {
  const suffix = randomBytes(6)
    .toString("hex")
    .toUpperCase();

  return `PL-${suffix}`;
}
