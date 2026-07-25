import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../shared/errors/index.js";

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Evita aviso do TypeScript sobre parâmetro não utilizado
  void req;
  void next;

  // Erros do Zod
  if (error instanceof ZodError) {
    return res.status(422).json({
      success: false,
      statusCode: 422,
      message: "Validation failed.",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Erros da aplicação
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      statusCode: error.statusCode,
      message: error.message,
    });
  }

  // Erros inesperados
  console.error(error);

  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal server error.",
  });
}