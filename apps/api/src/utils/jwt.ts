import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d";

export interface TokenPayload {
  userId: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não está definido nas variáveis de ambiente.");
  }

  return secret;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId } satisfies TokenPayload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
}