import jwt, { type SignOptions } from "jsonwebtoken";
import { randomUUID } from "node:crypto";

import { env } from "../../../config/env.js";
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "../types/JwtPayload.js";

export function generateAccessToken(
  userId: string,
  role: string,
): string {
  const payload: AccessTokenPayload = {
    sub: userId,
    role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
}

export function generateRefreshToken(userId: string) {
  const jti = randomUUID();

  const payload: RefreshTokenPayload = {
    sub: userId,
    jti,
  };

  const token = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  } as SignOptions);

  return {
    token,
    jti,
  };
}

export function verifyRefreshToken(
  token: string,
): RefreshTokenPayload {
  return jwt.verify(
    token,
    env.REFRESH_TOKEN_SECRET,
  ) as RefreshTokenPayload;
}

export function verifyAccessToken(
  token: string,
): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export function getExpirationDate(token: string): Date {
  const decoded = jwt.decode(token);

  if (
    !decoded ||
    typeof decoded === "string" ||
    typeof decoded.exp !== "number"
  ) {
    throw new Error("Invalid token.");
  }

  return new Date(decoded.exp * 1000);
}