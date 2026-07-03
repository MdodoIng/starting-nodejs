import express from "express";
import { db } from "./db/index.js";
import { notes, tags, noteTags } from "./db/schema.js";
import { eq } from "drizzle-orm";

const app = express();
app.use(express.json());

app.post("/notes", async (req, res) => {
  if (!req.body.title || req.body.title.length < 3) {
    return res
      .status(400)
      .json({ error: "Title must be at least 3 characters" });
  }
  const [note] = await db
    .insert(notes)
    .values({ title: req.body.title, body: req.body.body })
    .returning();
  res.status(201).json(note);
});

app.get("/notes", async (req, res) => {
  let query = db.select().from(notes);
  if (req.query.done !== undefined) {
    query = query.where(eq(notes.done, req.query.done === "true"));
  }
  const rows = await query;
  res.json(rows);
});

app.get("/notes/:id", async (req, res) => {
  const [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.id, Number(req.params.id)));
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

app.patch("/notes/:id", async (req, res) => {
  const updates = { ...req.body };
  if (updates.done === true) updates.completedAt = new Date();
  const [note] = await db
    .update(notes)
    .set(updates)
    .where(eq(notes.id, Number(req.params.id)))
    .returning();

  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

app.delete("/notes/:id", async (req, res) => {
  const [deleted] = await db
    .delete(notes)
    .where(eq(notes.id, Number(req.params.id)))
    .returning();
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.post("/tags", async (req, res) => {
  const [tag] = await db
    .insert(tags)
    .values({ name: req.body.name })
    .returning();
  res.status(201).json(tag);
});
app.post("/notes/:id/tags/:tagId", async (req, res) => {
  await db.insert(noteTags).values({
    noteId: Number(req.params.id),
    tagId: Number(req.params.tagId),
  });
  res.json({ ok: true });
});

app.get("/notes/:id/full", async (req, res) => {
  const note = await db.query.notes.findFirst({
    where: eq(notes.id, Number(req.params.id)),
    with: { noteTags: { with: { tag: true } } },
  });
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

app.listen(3000, () => console.log("Server on http://localhost:3000"));
