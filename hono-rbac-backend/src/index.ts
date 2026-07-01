import { Hono } from "hono";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

const app = new Hono();

app.route("/auth", authRoutes);
app.route("/users", userRoutes);

import { serve } from '@hono/node-server';

app.get("/", (c) => c.text("Hono RBAC Starter API"));

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});

export default app;