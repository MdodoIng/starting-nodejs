/**
 * Seeds the Redis instance with demo users and random scores across a couple
 * of games, so the leaderboard endpoints have data to show immediately.
 *
 * Usage: npm run seed
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { redis, keys } = require("../config/redis");
const { dailyKeyFor, weeklyKeyFor, monthlyKeyFor } = require("./period");

const DEMO_USERS = [
  "alice",
  "bob",
  "carol",
  "dave",
  "erin",
  "frank",
  "grace",
  "heidi",
];
const GAMES = ["space-invaders", "trivia-blitz"];

async function seed() {
  console.log("Seeding demo data...");
  const now = new Date();
  const dayKey = dailyKeyFor(now);
  const weekKey = weeklyKeyFor(now);
  const monthKey = monthlyKeyFor(now);

  for (const username of DEMO_USERS) {
    const existing = await redis.get(keys.usernameIndex(username));
    let userId = existing;
    if (!userId) {
      userId = await redis.incr(keys.userSeq);
      const passwordHash = await bcrypt.hash("password123", 10);
      await redis
        .multi()
        .hset(keys.user(userId), {
          id: userId,
          username,
          email: `${username}@example.com`,
          passwordHash,
          createdAt: now.toISOString(),
        })
        .set(keys.usernameIndex(username), userId)
        .exec();
      console.log(`  created user ${username} -> id ${userId}`);
    }

    for (const gameId of GAMES) {
      const score = Math.floor(Math.random() * 5000) + 100;
      await redis
        .multi()
        .zincrby(keys.globalLeaderboard, score, userId)
        .zincrby(keys.gameLeaderboard(gameId), score, userId)
        .zincrby(keys.dailyLeaderboard(dayKey), score, userId)
        .zincrby(keys.weeklyLeaderboard(weekKey), score, userId)
        .zincrby(keys.monthlyLeaderboard(monthKey), score, userId)
        .sadd(keys.games, gameId)
        .zadd(
          keys.history(userId),
          now.getTime(),
          JSON.stringify({
            gameId,
            score,
            mode: "add",
            timestamp: now.toISOString(),
          }),
        )
        .exec();
    }
  }

  console.log(
    "Done. Try: GET /api/leaderboard  and  GET /api/leaderboard/report?period=weekly",
  );
  await redis.quit();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
