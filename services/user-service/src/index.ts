import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { initSchema } from "./db/pool";
import { registerWithConsul, deregisterFromConsul } from "./consul";
import { register, httpRequestDuration, httpRequestsTotal } from "./metrics";

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = process.hrtime();
  res.on("finish", () => {
    const [sec, nano] = process.hrtime(start);
    const duration = sec + nano / 1e9;
    const route = req.route?.path || req.path;
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration,
    );
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });
  next();
});

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "user-service" }),
);

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use("/", authRoutes);

const PORT = parseInt(process.env.PORT || "4000");

initSchema()
  .then(() => {
    app.listen(PORT, async () => {
      console.log(`user-service listening on port ${PORT}`);
      await registerWithConsul(PORT);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize schema:", err);
    process.exit(1);
  });

process.on("SIGTERM", async () => {
  await deregisterFromConsul();
  process.exit(0);
});
