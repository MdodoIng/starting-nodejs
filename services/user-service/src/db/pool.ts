import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST || "user-db",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function initSchema(retries = 10, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `);
      return; // success
    } catch (err) {
      console.warn(
        `Database not ready yet (attempt ${attempt}/${retries}), retrying in ${delayMs}ms...`,
      );
      if (attempt === retries) throw err;
      await sleep(delayMs);
    }
  }
}
