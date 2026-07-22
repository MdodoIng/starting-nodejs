import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { initSchema } from "./db/pool";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "user-service" }),
);
app.use("/", authRoutes);

const PORT = parseInt(process.env.PORT || "4000");

initSchema()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`user-service listening on port ${PORT}`),
    );
  })
  .catch((err) => {
    console.error("Failed to initialize schema:", err);
    process.exit(1);
  });
