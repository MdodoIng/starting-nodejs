import { sign, verify } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-production";

export const createToken = async (payload: any) => {
  return await sign({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, JWT_SECRET); // 24h
};

export const verifyToken = async (token: string) => {
  return await verify(token, JWT_SECRET, "HS256");
};