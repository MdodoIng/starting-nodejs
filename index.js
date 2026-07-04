import express from "express";
import { db } from "./db.js";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const app = express();
app.use(express.json());

app.listen(3000, () => console.log("Server on http://localhost:3000"));

const storage = multer.diskStorage({
  destination: (req, res, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB cap
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Only video files are allowed"));
    }
    cb(null, true);
  },
});

app.post("/notes", upload.single("video"), async (req, res) => {
  const { title, body } = req.body;
  if (!title || title.length < 3) {
    return res
      .status(400)
      .json({ error: "Title must be at least 3 characters" });
  }
  const videoPath = req.file ? `/uploads/${req.file.filename}` : null;

  const [id] = await db("notes")
    .insert({ title, body, video_path: videoPath })
    .returning("id");
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

app.use("/uploads", express.static("uploads"));

app.get("/stream/:filename", (req, res) => {
  const filePath = path.join("uploads", req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("Not found");

  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  if (!range) {
    // No range requested — send the whole file
    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": "video/mp4",
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Parse "bytes=1000-" style range headers
  const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
  const start = parseInt(startStr, 10);
  const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
  const chunkSize = end - start + 1;

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${stat.size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": "video/mp4",
  });
  fs.createReadStream(filePath, { start, end }).pipe(res);
});
