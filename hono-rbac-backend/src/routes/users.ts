import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

type Variables = {
  user: any;
};
const app = new Hono<{ Variables: Variables }>();

// Protected: All authenticated users
app.use("/*", authMiddleware)

// Public profile (own)
app.get("/me", (c) => {
  const user = c.get("user");
  return c.json({ user });
});

// Admin only CRUD
app.use("/admin/*", requireRole(["admin"]));

app.get("/admin", async (c) => {
  const allUsers = await db.select().from(users);
  return c.json(allUsers);
});

app.post("/admin", async (c) => {
  // Add user logic (similar to signup)
  return c.json({ message: "Admin create" });
});

// Example: Moderator + Admin
app.get("/moderator", requireRole(["moderator", "admin"]), (c) => {
  return c.json({ message: "Moderator content" });
});

export default app;