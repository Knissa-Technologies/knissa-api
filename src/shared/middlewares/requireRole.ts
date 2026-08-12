import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type { ParamsDictionary } from "express-serve-static-core";

import { UserRole } from "@prisma/client";

import { ForbiddenError } from "../errors/ForbiddenError.js";

export function requireRole(...allowedRoles: UserRole[]) {
  return function <
    P extends ParamsDictionary = ParamsDictionary,
  >(
    req: Request<P>,
    _res: Response,
    next: NextFunction,
  ) {
    if (!req.user) {
      throw new ForbiddenError(
        "User authentication is required.",
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        "You do not have permission to access this resource.",
      );
    }

    next();
  };
}