import { db } from "../../db/database";
import { AppError } from "../../utils/AppError";

export function listUsers() {
  return db
    .prepare(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC",
    )
    .all();
}

export function promoteToAdmin(userId: number) {
  const user = db
    .prepare("SELECT id, role FROM users WHERE id = ?")
    .get(userId) as { id: number; role: string } | undefined;
  if (!user) {
    throw new AppError(404, "User not found");
  }
  db.prepare(`UPDATE users SET role = 'admin' WHERE id = ?`).run(userId);
  return db
    .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
    .get(userId);
}
