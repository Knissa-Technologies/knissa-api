import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export function generateAccessToken(data: {
  userId: string;
  sessionId: string;
  role: string;
}): string {
  return jwt.sign(
    {
      sub: data.userId,
      sessionId: data.sessionId,
      role: data.role,
    },
    getJwtSecret(),
    {
      expiresIn: "15m",
    },
  );
}