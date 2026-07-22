import crypto from "crypto";

export function generateTransactionReference(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const random = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `KNX-${year}${month}${day}-${random}`;
}