// setup.js — run once with `node setup.js`
import { pool } from "./db.js";

await pool.query(`
  CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT DEFAULT '',
    done BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
  );
`);
console.log("Table created");
process.exit(0);
