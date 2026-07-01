import { Hono } from "hono";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Vite default + backend
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Important if using cookies later
  }),
);

app.route("/auth", authRoutes);
app.route("/users", userRoutes);

import { serve } from "@hono/node-server";
import { cors } from "hono/cors";

app.get("/", (c) => c.text("Hono RBAC Starter API"));

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

export default app;
