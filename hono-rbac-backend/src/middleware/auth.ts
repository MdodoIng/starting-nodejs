import { createMiddleware } from "hono/factory";
import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = await verifyToken(token);
    c.set("user", payload);
    await next();
  } catch (e) {
    return c.json({ error: "Invalid token" }, 401);
  }
});