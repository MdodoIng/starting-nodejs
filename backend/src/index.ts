import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import genresRoutes from "./modules/genres/genres.routes";
import moviesRoutes from "./modules/movies/movies.routes";
import screensRoutes from "./modules/screens/screens.routes";
import showtimesRoutes from "./modules/showtimes/showtimes.routes";
import reservationsRoutes from "./modules/reservations/reservations.routes";
import reportsRoutes from "./modules/reports/reports.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/genres", genresRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/screens", screensRoutes);
app.use("/api/showtimes", showtimesRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/reports", reportsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Movie Reservation System API listening on port ${PORT}`);
});

export default app;
