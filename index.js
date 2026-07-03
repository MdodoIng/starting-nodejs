import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// ---------- Notes ----------

app.post("/notes", async (req, res) => {
  const { title, body, tags } = req.body;
  if (!title || title.length < 3) {
    return res
      .status(400)
      .json({ error: "Title must be at least 3 characters" });
  }
  try {
    const note = await prisma.note.create({
      data: {
        title,
        body,
        tags: tags?.length
          ? { connect: tags.map((id) => ({ id: Number(id) })) }
          : undefined,
      },
      include: { tags: true },
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/notes", async (req, res) => {
  const where = {};
  if (req.query.done !== undefined) {
    where.done = req.query.done === "true";
  }
  const notes = await prisma.note.findMany({
    where,
    include: { tags: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(notes);
});

app.get("/notes/:id", async (req, res) => {
  const note = await prisma.note.findUnique({
    where: { id: Number(req.params.id) },
    include: { tags: true },
  });
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

app.patch("/notes/:id", async (req, res) => {
  try {
    const { tags, ...data } = req.body;
    if (data.done === true) data.completedAt = new Date();
    const note = await prisma.note.update({
      where: { id: Number(req.params.id) },
      data: {
        ...data,
        ...(tags
          ? { tags: { set: tags.map((id) => ({ id: Number(id) })) } }
          : {}),
      },
      include: { tags: true },
    });
    res.json(note);
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
});

app.delete("/notes/:id", async (req, res) => {
  try {
    await prisma.note.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
});

// ---------- Tags ----------

app.post("/tags", async (req, res) => {
  try {
    const tag = await prisma.tag.create({ data: req.body });
    res.status(201).json(tag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/tags", async (req, res) => {
  const tags = await prisma.tag.findMany();
  res.json(tags);
});

// Link an existing tag to an existing note
app.post("/notes/:id/tags/:tagId", async (req, res) => {
  try {
    const note = await prisma.note.update({
      where: { id: Number(req.params.id) },
      data: { tags: { connect: { id: Number(req.params.tagId) } } },
      include: { tags: true },
    });
    res.json(note);
  } catch (err) {
    res.status(404).json({ error: "Note or tag not found" });
  }
});

// ---------- Relation filters ----------

app.get("/notes/by-tag/:tagName", async (req, res) => {
  const notes = await prisma.note.findMany({
    where: { tags: { some: { name: req.params.tagName } } },
    include: { tags: true },
  });
  res.json(notes);
});

// ---------- Combined search (capstone) ----------

app.get("/notes/search", async (req, res) => {
  const { q, tag, sort } = req.query;
  const where = {};
  if (q) where.title = { contains: q };
  if (tag) where.tags = { some: { name: tag } };

  const orderBy = sort
    ? { [sort.replace("-", "")]: sort.startsWith("-") ? "desc" : "asc" }
    : { createdAt: "desc" };

  const notes = await prisma.note.findMany({ where, include: { tags: true }, orderBy });
  res.json(notes);
});

app.listen(3000, () => console.log("Server on http://localhost:3000"));
