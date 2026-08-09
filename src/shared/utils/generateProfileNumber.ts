import { randomUUID } from "crypto";

export function generateProfileNumber(): string {
  return `PRO-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)
    .toUpperCase()}`;
}