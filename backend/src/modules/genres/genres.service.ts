import { db } from "../../db/database";
import { AppError } from "../../utils/AppError";

export function listGenres() {
  return db.prepare("SELECT * FROM genres ORDER BY name ASC").all();
}

export function createGenre(name: string) {
  const existing = db.prepare("SELECT id FROM genres WHERE name = ?").get(name);
  if (existing) throw new AppError(409, "Genre already exists");
  const info = db.prepare("INSERT INTO genres (name) VALUES (?)").run(name);
  return db
    .prepare("SELECT * FROM genres WHERE id = ?")
    .get(info.lastInsertRowid);
}
