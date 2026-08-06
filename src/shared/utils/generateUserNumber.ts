import { randomUUID } from "crypto";

export function generateUserNumber(): string {
  return `USR-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}