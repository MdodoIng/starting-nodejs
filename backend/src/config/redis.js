const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => console.log("[redis] connected"));
redis.on("error", (err) => console.error("[redis] error:", err.message));

/**
 * Centralized Redis key naming so the whole app agrees on a schema.
 *
 * Data model:
 *  - user:{id}                  HASH   { username, email, passwordHash, createdAt }
 *  - username:{username}        STRING -> userId  (unique username lookup)
 *  - user:id:seq                STRING counter (INCR) for auto-incrementing ids
 *  - leaderboard:global         ZSET   member=userId score=total score (all-time)
 *  - leaderboard:game:{gameId}  ZSET   member=userId score=total score for that game
 *  - leaderboard:daily:{date}   ZSET   member=userId score=points that day (TTL'd)
 *  - leaderboard:weekly:{wk}    ZSET   member=userId score=points that week (TTL'd)
 *  - leaderboard:monthly:{mo}   ZSET   member=userId score=points that month (TTL'd)
 *  - history:{userId}          ZSET   member=JSON entry, score=timestamp (capped)
 *  - games                     SET    known game ids, for discovery
 */
const keys = {
  userSeq: "user:id:seq",
  user: (id) => `user:${id}`,
  usernameIndex: (username) => `username:${username.toLowerCase()}`,
  globalLeaderboard: "leaderboard:global",
  gameLeaderboard: (gameId) => `leaderboard:game:${gameId}`,
  dailyLeaderboard: (dateStr) => `leaderboard:daily:${dateStr}`,
  weeklyLeaderboard: (weekStr) => `leaderboard:weekly:${weekStr}`,
  monthlyLeaderboard: (monthStr) => `leaderboard:monthly:${monthStr}`,
  history: (userId) => `history:${userId}`,
  games: "games",
};

module.exports = { redis, keys };
