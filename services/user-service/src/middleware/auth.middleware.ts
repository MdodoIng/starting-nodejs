import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface AuthedRequest extends Request {
  user?: { id: number; username: string };
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ error: "Missing or malformed Authorization header" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      sub: number;
      username: string;
    };
    req.user = { id: decoded.sub, username: decoded.username };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
