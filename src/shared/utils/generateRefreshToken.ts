import { randomBytes } from "crypto";

export function generateRefreshToken(): string {
  return randomBytes(64).toString("hex");
}