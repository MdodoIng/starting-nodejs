import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source.js";
import { Note } from "./entity/Note.js";
import { Tag } from "./entity/Tag.js";

const app = express();
app.use(express.json());

AppDataSource.initialize().then(() => {
  console.log("Data source initialized");
  app.listen(3000, () => console.log("Server on http://localhost:3000"));
});

app.post("/notes", async (req, res) => {
  const repo = AppDataSource.getRepository(Note);
  if (!req.body.title || req.body.title.length < 3) {
    return res
      .status(400)
      .json({ error: "Title must be at least 3 characters" });
  }
  const note = repo.create(req.body); // builds an in-memory instance
  await repo.save(note);
  res.status(201).json(note);
});

app.get("/notes", async (req, res) => {
  const repo = AppDataSource.getRepository(Note);
  const where =
    req.query.done !== undefined
      ? {
          done: req.query.done === "true",
        }
      : {};
  const notes = await repo.find({ where });
  res.json(notes);
});

app.get("/notes/:id", async (req, res) => {
  const repo = AppDataSource.getRepository(Note);
  const note = await repo.findOneBy({ id: Number(req.params.id) });
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

app.patch("/notes/:id", async (req, res) => {
  const repo = AppDataSource.getRepository(Note);
  const note = await repo.findOneBy({ id: Number(req.params.id) });
  if (!note) return res.status(404).json({ error: "Not found" });

  Object.assign(note, req.body);
  if (req.body.done === true) note.completedAt = new Date();

  await repo.save(note);
  res.json(note);
});

app.delete("/notes/:id", async (req, res) => {
  const repo = AppDataSource.getRepository(Note);
  const result = await repo.delete({ id: Number(req.params.id) });
  if (result.affected === 0)
    return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.post("/tags", async (req, res) => {
  const repo = AppDataSource.getRepository(Tag);
  const tag = repo.create(req.body);
  await repo.save(tag);
  res.status(201).json(tag);
});

app.get("/notes/:id/full", async (req, res) => {
  const repo = AppDataSource.getRepository(Note);
  const note = await repo.findOne({
    where: { id: Number(req.params.id) },
    relations: { tags: true },
  });
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

app.get("/notes/by-tag/:tagName", async (req, res) => {
  const repo = AppDataSource.getRepository(Note);
  const notes = await repo
    .createQueryBuilder("note")
    .innerJoin("note.tags", "tag")
    .where("tag.name = :name", { name: req.params.tagName })
    .getMany();
  res.json(notes);
});