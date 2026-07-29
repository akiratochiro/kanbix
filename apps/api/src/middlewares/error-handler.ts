import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  console.error(error);

  res.status(500).json({ message: "Erro interno do servidor." });
}   