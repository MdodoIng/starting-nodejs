import db from "../../db/database";
import { User } from "../../types";
import { AppError } from "../../utils/AppError";
import bcrypt from "bcryptjs";
import { signToken } from "../../utils/jwt";

export function signup(name: string, email: string, password: string) {
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email);
  if (existing) {
    throw new AppError(409, "An account with this email already exists");
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare(
      `
    INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')
    `,
    )
    .run(name, email, passwordHash);

  const user = db
    .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
    .get(info.lastInsertRowid) as Omit<User, "password_hash">;

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { user, token };
}

export function login(email: string, password: string) {
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | User
    | undefined;

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }
  const matches = bcrypt.compareSync(password, user.password_hash);
  if (!matches) {
    throw new AppError(401, "Invalid email or password");
  }
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

export function getUserById(id: number) {
  const user = db
    .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
    .get(id) as Omit<User, "password_hash"> | undefined;
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return user;
}
