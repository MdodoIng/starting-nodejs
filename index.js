import express from "express";
import { pool } from "./db.js";
import { logger } from "./logger.js";

const app = express();
app.use(express.json());

app.listen(
  3000,
  () => console.log("Server on http://localhost:3000"),
  logger.info("Server starting up"),
  logger.warn("This is a warning"),
  logger.error("Something went wrong"),
);

app.post("/notes", async (req, res) => {
  logger.info(`Creating note: ${req.body.title}`);
  try {
    const result = await pool.query(
      "INSERT INTO notes (title, body) VALUES ($1, $2) RETURNING *",
      [req.body.title, req.body.body || ""],
    );
    logger.info(`Note created with id ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error(`Failed to create note: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
});

app.get("/notes", async (req, res) => {
  let query = "SELECT * FROM notes";
  const params = [];
  if (req.query.done !== undefined) {
    query += " WHERE done = $1";
    params.push(req.query.done === "true");
  }
  const result = await pool.query(query, params);
  res.json(result.rows);
});

app.get("/notes/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM notes WHERE id = $1", [
    req.params.id,
  ]);
  if (result.rows.length === 0)
    return res.status(404).json({ error: "Not found" });
  res.json(result.rows[0]);
});

app.patch("/notes/:id", async (req, res) => {
  const fields = [];
  const params = [];
  let i = 1;

  for (const [key, value] of Object.entries(req.body)) {
    fields.push(`${key} = $${i}`);
    params.push(value);
    i++;
  }
  if (req.body.done === true) {
    fields.push(`completed_at = $${i}`);
    params.push(new Date());
    i++;
  }
  params.push(req.params.id);

  const result = await pool.query(
    `UPDATE notes SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
    params,
  );
  if (result.rows.length === 0)
    return res.status(404).json({ error: "Not found" });
  res.json(result.rows[0]);
});

app.delete("/notes/:id", async (req, res) => {
  const result = await pool.query(
    "DELETE FROM notes WHERE id = $1 RETURNING id",
    [req.params.id],
  );
  if (result.rows.length === 0)
    return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.post("/tags", async (req, res) => {
  const result = await pool.query(
    "INSERT INTO tags (name) VALUES ($1) RETURNING *",
    [req.body.name],
  );
  res.status(201).json(result.rows[0]);
});

app.post("/notes/:id/tags/:tagId", async (req, res) => {
  await pool.query(
    "INSERT INTO note_tags (note_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [req.params.id, req.params.tagId],
  );
  res.json({ ok: true });
});

app.get("/notes/by-tag/:tagName", async (req, res) => {
  const result = await pool.query(
    `SELECT notes.* FROM notes
     JOIN note_tags ON notes.id = note_tags.note_id
     JOIN tags ON note_tags.tag_id = tags.id
     WHERE tags.name = $1`,
    [req.params.tagName],
  );
  res.json(result.rows);
});

app.post("/notes/:id/tags/bulk", async (req, res) => {
  const client = await pool.connect(); // check out a single connection from the pool
  try {
    await client.query("BEGIN");
    for (const tagId of req.body.tagIds) {
      await client.query(
        "INSERT INTO note_tags (note_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [req.params.id, tagId],
      );
    }
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: err.message });
  } finally {
    client.release(); // always return the connection to the pool
  }
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});
