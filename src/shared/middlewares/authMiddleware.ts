import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import { UserRole } from "@prisma/client";

import { UnauthorizedError } from "../errors/UnauthorizedError.js";

interface AccessTokenPayload {
  sub: string;
  sessionId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new UnauthorizedError("Authorization header is required.");
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Invalid authorization format.");
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as AccessTokenPayload;

    if (!payload.sub || !payload.sessionId || !payload.role) {
      throw new UnauthorizedError("Invalid access token.");
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    req.sessionId = payload.sessionId;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    throw new UnauthorizedError("Invalid or expired access token.");
  }
}
