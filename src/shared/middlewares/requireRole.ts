import type { NextFunction, Request, Response } from "express";

import { UserRole } from "@prisma/client";

import { ForbiddenError } from "../errors/ForbiddenError.js";

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ForbiddenError("User authentication is required.");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        "You do not have permission to access this resource.",
      );
    }

    next();
  };
}
