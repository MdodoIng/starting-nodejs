require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const { redis } = require("./config/redis");
const authRoutes = require("./routes/authRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.set("io", io);

app.use(cors());
app.use(express.json());

// Basic rate limiting to protect score submission / auth endpoints from abuse

const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use("/api", apiLimiter);

app.get("/health", async (req, res) => {
  try {
    const pong = await redis.ping();
    res.json({ status: "ok", redis: pong });
  } catch (err) {
    res.status(503).json({ status: "error", error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// --- Socket.IO real-time layer ---
// Clients subscribe to a "room" (global, or a specific game) and receive
// 'leaderboard:update' events whenever any user's score changes there.
io.on("connection", (socket) => {
  socket.on("subscribe:global", () => socket.join("global"));
  socket.on("subscribe:game", (gameId) => {
    if (typeof gameId === "string" && gameId.length > 0) {
      socket.join(`game:${gameId}`);
    }
  });
  socket.on("unsubscribe:game", (gameId) => socket.leave(`game:${gameId}`));
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🏆 Leaderboard service listening on port ${PORT}`);
});

module.exports = { app, server, io };
