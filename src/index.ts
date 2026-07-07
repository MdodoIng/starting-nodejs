import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Movie Reservation System API listening on port ${PORT}`);
});

export default app;
