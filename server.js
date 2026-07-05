import express from "express";
import { Worker } from "node:worker_threads";
import Piscina from "piscina";
import { fileURLToPath } from "node:url";

const app = express();
const pool = new Piscina({
  filename: fileURLToPath(new URL("./pool-worker.js", import.meta.url)),
});

function slowFib(n) {
  if (n <= 1) return n;
  return slowFib(n - 1) + slowFib(n - 2);
}

app.get("/fib/:n", async (req, res) => {
  const result = await pool.run({ n: Number(req.params.n) });
  res.json({ result });
});

app.get("/ping", (req, res) => res.json({ pong: true }));

app.listen(3000, () => console.log("Server on http://localhost:3000"));

app.post("/process", express.json(), (req, res) => {
  const worker = new Worker("./worker.js", {
    workerData: { numbers: req.body.numbers },
  });
  worker.on("message", (result) => res.json(result));
  worker.on("error", (err) => res.status(500).json({ error: err.message }));
});

app.get("/notes", async (req, res) => {
  const result = await pool.query("SELECT * FROM notes"); // from your pg-demo project
  res.json(result.rows);
});

app.post("/register", async (req, res) => {
  const hash = await pool.run({ password: req.body.password });
  res.json({ hash });
});
