import cluster from "node:cluster";
import os from "node:os";
import express from "express";

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork(i);
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died (code: ${code}) — forking a replacement`,
    );
    cluster.fork();
  });
} else {
  // This code runs inside each forked worker process
  const app = express();

  function slowFib(n) {
    if (n <= 1) return n;
    return slowFib(n - 1) + slowFib(n - 2);
  }

  app.get("/fib/:n", (req, res) => {
    res.json({ result: slowFib(Number(req.params.n)), pid: process.pid });
  });

  app.listen(3000, () =>
    console.log(`Worker ${process.pid} listening on 3000`),
  );

  app.get("/crash", () => {
    process.exit(1);
  });

  // inside the worker branch, add a route
  app.get("/report", (req, res) => {
    process.send({
      event: "report",
      pid: process.pid,
      memory: process.memoryUsage().heapUsed,
    });
    res.json({ ok: true });
  });

  // primary branch
  let totalRequests = 0;

  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    worker.on("message", (msg) => {
      if (msg.event === "request") {
        totalRequests++;
        console.log(`Total requests across all workers: ${totalRequests}`);
      }
    });
  }

  // worker branch — middleware that reports every request
  app.use((req, res, next) => {
    process.send({ event: "request" });
    next();
  });
}
