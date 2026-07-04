import express from "express";
import { sequelize } from "./models/index.js";
import { Note } from "./models/Note.js";
import { Tag } from "./models/Tag.js";

const app = express();
app.use(express.json());

sequelize
  .authenticate()
  .then(() => console.log("Connection established"))
  .then(() =>
    app.listen(3000, () => console.log("Sever on http://localhost:3000")),
  )
  .catch((err) => console.error("Unable to connect:", err));

await sequelize.sync();

app.post("/notes", async (req, res) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/notes", async (req, res) => {
  const where = {};
  if (req.query.done !== undefined) where.done = req.query.done === "true";
  const notes = await Note.findAll({ where });
  res.json(notes);
});

app.get("/notes/:id", async (req, res) => {
  const note = await Note.findByPk(req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

app.patch("/notes/:id", async (req, res) => {
  const note = await Note.findByPk(req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });

  if (req.body.done === true) req.body.completedAt = new Date();
  await note.update(req.body);
  res.json(note);
});

app.delete("/notes/:id", async (req, res) => {
  const note = await Note.findByPk(req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });
  await note.destroy();
  res.json({ ok: true });
});

app.post("/tags", async (req, res) => {
  const tag = await Tag.create(req.body);
  res.status(201).json(tag);
});

app.post("/notes/:id/tags/:tagId", async (req, res) => {
  const note = await Note.findByPk(req.params.id);
  const tag = await Tag.findByPk(req.params.tagId);
  await note.addTag(tag); // auto-generated method from belongsToMany!
  res.json({ ok: true });
});

app.get("/notes/:id/full", async (req, res) => {
  const note = await Note.findByPk(req.params.id, { include: Tag });
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

app.get("/notes/by-tag/:tagName", async (req, res) => {
  const notes = await Note.findAll({
    include: {
      model: Tag,
      where: { name: req.params.tagName },
    },
  });
  res.json(notes);
});
