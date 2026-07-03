import express from "express";
import { connectDB } from "./db.js";
import { Note } from "./models/Note.js";
import { Tag } from "./models/Tag.js";

const app = express();
app.use(express.json());

app.post("/notes", async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json(note);
});

app.post("/notes", async (req, res) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/notes", async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

app.get("/note/:id", async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

app.patch("/notes/:id", async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return the updated doc, not the old one
    runValidators: true, // re-run schema validation on update too
  });
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

app.delete("/notes/:id", async (req, res) => {
  const note = await Note.findByIdAndDelete(req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.get("/notes/:id/full", async (req, res) => {
  const note = await Note.findById(req.params.id).populate("tags");
  res.json(note);
});



app.post("/tags", async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json(tag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/tags", async (req, res) => {
  const tags = await Tag.find();
  res.json(tags);
});

app.get("/", (req, res) => res.send("Mongoose demo running"));

connectDB().then(() => {
  app.listen(3000, () => console.log("Server on http://localhost:3000"));
});
