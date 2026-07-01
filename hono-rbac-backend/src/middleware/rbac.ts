import { createMiddleware } from "hono/factory";

export const requireRole = (allowedRoles: string[]) => {
  return createMiddleware(async (c, next) => {
    const user = c.get("user");
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ error: "Forbidden: Insufficient permissions" }, 403);
    }
    await next();
  });
};