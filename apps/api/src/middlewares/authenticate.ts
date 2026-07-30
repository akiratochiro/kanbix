import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { InvalidTokenError, MissingTokenError } from "../utils/errors";

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new MissingTokenError();
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new InvalidTokenError();
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new InvalidTokenError();
    }

    req.userId = payload.userId;
    next();
  } catch (error) {
    next(error);
  }
}