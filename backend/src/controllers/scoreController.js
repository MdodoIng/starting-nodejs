const { redis, keys } = require("../config/redis");
const {
  dailyKeyFor,
  weeklyKeyFor,
  monthlyKeyFor,
  TTL_DAILY,
  TTL_WEEKLY,
  TTL_MONTHLY,
} = require("../utils/period");

const HISTORY_LIMIT = parseInt(process.env.HISTORY_LIMIT || "100", 10);

/**
 * POST /api/scores
 * body: { gameId: string, score: number, mode?: 'add' | 'set' }
 *
 * 'add' (default) increments the user's existing score by the submitted amount
 * (good for cumulative points). 'set' overwrites with the submitted value
 * (good for "best time" / high-score-only games where you compute the max
 * client-side, or simply want the latest value to win).
 */

async function submitScore(req, res) {
  try {
    const { gameId, score, mode = "add" } = req.body;
    const userId = String(req.user.id);
    if (!gameId || typeof gameId !== "string") {
      return res.status(400).json({ error: "gameId (string) is required" });
    }
    const numericScore = Number(score);
    if (!Number.isFinite(numericScore)) {
      return res.status(400).json({ error: "score must be a finite number" });
    }
    if (!["add", "set"].includes(mode)) {
      return res.status(400).json({ error: "mode must be 'add' or 'set'" });
    }
    const now = new Date();
    const dayKey = dailyKeyFor(now);
    const weekKey = weeklyKeyFor(now);
    const monthKey = monthlyKeyFor(now);

    const pipeline = redis.multi();
    if (mode === "add") {
      pipeline.zincrby(keys.globalLeaderboard, numericScore, userId);
      pipeline.zincrby(keys.gameLeaderboard(gameId), numericScore, userId);
      pipeline.zincrby(keys.dailyLeaderboard(dayKey), numericScore, userId);
      pipeline.zincrby(keys.weeklyLeaderboard(weekKey), numericScore, userId);
      pipeline.zincrby(keys.monthlyLeaderboard(monthKey), numericScore, userId);
    } else {
      // 'set' mode: only keep the score if it's higher than the current one.
      // ZADD GT updates the member's score only if the new score is greater.
      pipeline.zadd(keys.globalLeaderboard, "GT", numericScore, userId);
      pipeline.zadd(keys.gameLeaderboard(gameId), "GT", numericScore, userId);
      pipeline.zadd(keys.dailyLeaderboard(dayKey), "GT", numericScore, userId);
      pipeline.zadd(
        keys.weeklyLeaderboard(weekKey),
        "GT",
        numericScore,
        userId,
      );
      pipeline.zadd(
        keys.monthlyLeaderboard(monthKey),
        "GT",
        numericScore,
        userId,
      );
    }
    pipeline.expire(keys.dailyLeaderboard(dayKey), TTL_DAILY);
    pipeline.expire(keys.weeklyLeaderboard(weekKey), TTL_WEEKLY);
    pipeline.expire(keys.monthlyLeaderboard(monthKey), TTL_MONTHLY);
    pipeline.sadd(keys.games, gameId);

    const historyEntry = JSON.stringify({
      gameId,
      score: numericScore,
      mode,
      timestamp: now.toISOString(),
    });

    pipeline.zadd(keys.history(userId), now.getTime(), historyEntry);

    await pipeline.exec();

    // Trim history to the most recent HISTORY_LIMIT entries (keep it bounded).
    const historyCount = await redis.zcard(keys.history(userId));
    if (historyCount > HISTORY_LIMIT) {
      await redis.zremrangebyrank(
        keys.history(userId),
        0,
        historyCount - HISTORY_LIMIT - 1,
      );
    }
    const [globalScore, globalRank, gameScore, gameRank] = await Promise.all([
      redis.zscore(keys.globalLeaderboard, userId),
      redis.zrevrank(keys.globalLeaderboard, userId),
      redis.zscore(keys.gameLeaderboard(gameId), userId),
      redis.zrevrank(keys.gameLeaderboard(gameId), userId),
    ]);

    const result = {
      userId,
      gameId,
      submittedScore: numericScore,
      mode,
      global: {
        score: Number(globalScore),
        rank: globalRank === null ? null : globalRank + 1,
      },
      game: {
        score: Number(gameScore),
        rank: gameRank === null ? null : gameRank + 1,
      },
    };

    // Real-time push to any connected clients (Socket.IO instance attached in server.js)
    const io = req.app.get("io");
    if (io) {
      io.to(`game:${gameId}`).emit("leaderboard:update", result);
      io.to("global").emit("leaderboard:update", result);
    }
    return res.status(201).json(result);
  } catch (err) {
    console.error("submitScore error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/scores/history/:userId?
 * Returns a user's score submission history, most recent first.
 */
async function getHistory(req, res) {
  try {
    const targetUserId = req.params.userId || req.user.id;
    const limit = Math.min(
      parseInt(req.query.limit || "20", 10),
      HISTORY_LIMIT,
    );

    const raw = await redis.zrevrange(keys.history(targetUserId), 0, limit - 1);
    const entries = raw.map((e) => JSON.parse(e));

    return res.json({
      userId: targetUserId,
      count: entries.length,
      history: entries,
    });
  } catch (err) {
    console.error("getHistory error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { submitScore, getHistory };
