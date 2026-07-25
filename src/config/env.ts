import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 3000),

  JWT_SECRET: required("JWT_SECRET"),
  REFRESH_TOKEN_SECRET: required("REFRESH_TOKEN_SECRET"),

  JWT_EXPIRES_IN: required("JWT_EXPIRES_IN") as `${number}${"s" | "m" | "h" | "d"}`,

  REFRESH_TOKEN_EXPIRES_IN: required(
    "REFRESH_TOKEN_EXPIRES_IN",
  ) as `${number}${"s" | "m" | "h" | "d"}`,
};