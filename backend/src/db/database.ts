import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const dbPath = process.env.DATABASE_PATH || "./data/movie_reservations.db";
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

/**
 * Mimics better-sqlite3's db.transaction(fn) API on top of node:sqlite,
 * which has no built-in transaction helper. Since node:sqlite is
 * synchronous and Node is single-threaded, wrapping BEGIN/COMMIT/ROLLBACK
 * around a synchronous function body is enough to make the whole
 * operation atomic from the app's point of view - no other request can
 * interleave statements in between.
 */
export function transaction<Args extends any[], R>(
  fn: (...args: Args) => R,
): (...args: Args) => R {
  return (...args: Args): R => {
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = fn(...args);
      db.exec("COMMIT");
      return result;
    } catch (err) {
      try {
        db.exec("ROLLBACK");
      } catch {
        /* ignore rollback failure if transaction was never fully started */
      }
      throw err;
    }
  };
}

export default db;
