import express from "express";
import { db } from "./db.js";

const app = express();
app.use(express.json());

app.listen(3000, () => console.log("Server on http://localhost:3000"));

app.post("/notes", async (req, res) => {
  const { title, body } = req.body;
  if (!title || title.length < 3) {
    return res
      .status(400)
      .json({ error: "Title must be at least 3 characters" });
  }
  const [id] = await db("notes").insert({ title, body }).returning("id");
  const note = await db("notes")
    .where({ id: id.id ?? id })
    .first();
  res.status(201).json(note);
});

app.get("/notes", async (req, res) => {
  let query = db("notes").select("*");
  if (req.query.done !== undefined) {
    query = query.where({ done: req.query.done === "true" });
  }
  const notes = await query;
  res.json(notes);
});

app.get("/notes/:id", async (req, res) => {
  const note = await db("notes").where({ id: req.params.id }).first();
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

app.patch("/notes/:id", async (req, res) => {
  const updates = { ...req.body };
  if (updates.done === true) updates.completed_at = new Date().toISOString();

  const count = await db("notes").where({ id: req.params.id }).update(updates);
  if (count === 0) return res.status(404).json({ error: "Not found" });

  const note = await db("notes").where({ id: req.params.id }).first();
  res.json(note);
});

app.delete("/notes/:id", async (req, res) => {
  const count = await db("notes").where({ id: req.params.id }).del();
  if (count === 0) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.post("/tags", async (req, res) => {
  const [id] = await db("tags").insert({ name: req.body.name }).returning("id");
  const tag = await db("tags")
    .where({ id: id.id ?? id })
    .first();
  res.status(201).json(tag);
});

app.post("/notes/:id/tags/:tagId", async (req, res) => {
  await db("note_tags").insert({
    note_id: req.params.id,
    tag_id: req.params.tagId,
  });
  res.json({ ok: true });
});

app.get("/notes/by-tag/:tagName", async (req, res) => {
  const notes = await db("notes")
    .join("note_tags", "notes.id", "note_tags.note_id")
    .join("tags", "note_tags.tag_id", "tags.id")
    .where("tags.name", req.params.tagName)
    .select("notes.*");
  res.json(notes);
});

app.get("/notes/stats", async (req, res) => {
  const stats = await db.raw(
    "SELECT done, COUNT(*) as count FROM notes GROUP BY done",
  );
  res.json(stats);
});

