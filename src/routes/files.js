import { Router } from "express";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { existsSync } from "node:fs";

const router = Router();
const SHARED_DIR = path.resolve("shared");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, SHARED_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    let finalName = `${base}${ext}`;
    let counter = 1;

    while (existsSync(path.join(SHARED_DIR, finalName))) {
      finalName = `${base}(${counter})${ext}`;
      counter++;
    }

    cb(null, finalName);
  },
});

const upload = multer({ storage });

router.get("/api/files", async (req, res) => {
  const names = await readdir(SHARED_DIR);
  const files = await Promise.all(
    names.map(async (name) => {
      const s = await stat(path.join(SHARED_DIR, name));
      return { name, size: s.size, isDir: s.isDirectory() };
    }),
  );
  res.json(files);
});

router.get("/api/download/:name", (req, res) => {
  const filePath = path.join(SHARED_DIR, req.params.name);
  // Guard against path traversal — someone requesting ../../etc/passwd
  if (!filePath.startsWith(SHARED_DIR)) {
    return res.status(400).send("Invalid path");
  }
  res.download(filePath);
});

router.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ ok: true, filename: req.file.originalname });
});

export default router;
