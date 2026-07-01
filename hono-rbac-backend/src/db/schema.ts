import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  name: text("name"),
  role: text("role", { enum: ["user", "admin", "moderator"] }).default("user"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});