import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { error } from "console";
import bcrypt from "bcryptjs";
import { createToken } from "../utils/jwt.js";

const app = new Hono()

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

app.post("/signup", zValidator("json", signupSchema), async (c) => {
  const { email, password, name } = c.req.valid("json")

  const existing = await db.select().from(users).where(eq(users.email, email))
  if (existing.length > 0) return c.json({ error: "User exists" }, 400)

  const hashed = await bcrypt.hash(password, 10)
  const [newUser] = await db.insert(users).values({
    email, password: hashed, name
  }).returning()

  const token = await createToken({ id: newUser.id, email: newUser.email, role: newUser.role });
  return c.json({ token, user: { id: newUser.id, email: newUser.email, role: newUser.role } });
});

app.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json")
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json({ error: "Invalid credentials" }, 401);
  }
  const token = await createToken({ id: user.id, email: user.email, role: user.role });
  return c.json({ token, user: { id: user.id, email: user.email, role: user.role } });
})

export default app