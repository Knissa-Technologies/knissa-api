import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/AppError.js";

export function errorHandler(
  error: Error,
  _: Request,
  res: Response,
  __: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: error.issues,
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
}