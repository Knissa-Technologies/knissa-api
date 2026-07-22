import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { AppError } from "../errors/AppError.js";

interface TokenPayload {
  sub: string;
  role: string;
}

export function authMiddleware(
  req: Request,
  _: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token not provided.", 401);
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    throw new AppError("Invalid token.", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as TokenPayload;

    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch {
    throw new AppError("Invalid or expired token.", 401);
  }
}