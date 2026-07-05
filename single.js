import express from "express";
const app = express();

function slowFib(n) {
  if (n <= 1) return n;
  return slowFib(n - 1) + slowFib(n - 2);
}

app.get("/fib/:n", (req, res) => {
  res.json({ result: slowFib(Number(req.params.n)), pid: process.pid });
});

app.listen(3000, () => console.log(`Worker ${process.pid} listening on 3000`));

