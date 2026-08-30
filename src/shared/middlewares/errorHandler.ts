
import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { ZodError } from "zod";

import { AppError } from "../errors/AppError.js";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // ======================================================
  // ZOD VALIDATION ERROR
  // ======================================================

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error.",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // ======================================================
  // APPLICATION ERROR
  // ======================================================

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // ======================================================
  // UNEXPECTED ERROR
  // ======================================================

  console.error(error);

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
}
