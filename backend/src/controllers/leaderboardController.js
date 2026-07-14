const { redis, keys } = require("../config/redis");
const { dailyKeyFor, weeklyKeyFor, monthlyKeyFor } = require("../utils/period");

/**
 * Hydrate a flat [member, score, member, score, ...] array (from ZREVRANGE
 * WITHSCORES) into ranked, user-enriched objects.
 */
async function hydrate(flatMembersScores, startRank = 0) {
  const rows = [];
  for (let i = 0; i < flatMembersScores.length; i += 2) {
    rows.push({
      userId: flatMembersScores[i],
      score: Number(flatMembersScores[i + 1]),
    });
  }

  if (rows.length === 0) return [];

  const pipeline = redis.pipeline();
  rows.forEach((r) => pipeline.hget(keys.user(r.userId), "username"));
  const usernames = await pipeline.exec();

  return rows.map((r, idx) => ({
    rank: startRank + idx + 1,
    userId: r.userId,
    username: usernames[idx][1] || "(unknown)",
    score: r.score,
  }));
}

function resolveLeaderboardKey(scope, gameId, period) {
  const now = new Date();
  if (scope === "game") {
    if (!gameId)
      throw Object.assign(new Error("gameId is required for scope=game"), {
        status: 400,
      });
    return keys.gameLeaderboard(gameId);
  }
  if (period === "daily") return keys.dailyLeaderboard(dailyKeyFor(now));
  if (period === "weekly") return keys.weeklyLeaderboard(weeklyKeyFor(now));
  if (period === "monthly") return keys.monthlyLeaderboard(monthlyKeyFor(now));
  return keys.globalLeaderboard; // all-time global
}

/**
 * GET /api/leaderboard?scope=global|game&gameId=...&period=alltime|daily|weekly|monthly&limit=10&offset=0
 */
async function getLeaderboard(req, res) {
  try {
    const { scope = "global", gameId, period = "alltime" } = req.query;
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 100);
    const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

    const key = resolveLeaderboardKey(scope, gameId, period);
    const total = await redis.zcard(key);
    const flat = await redis.zrevrange(
      key,
      offset,
      offset + limit - 1,
      "WITHSCORES",
    );
    const leaderboard = await hydrate(flat, offset);

    return res.json({
      scope,
      gameId: gameId || null,
      period,
      total,
      leaderboard,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error("getLeaderboard error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/leaderboard/rank/:userId?scope=global|game&gameId=...&period=...
 * Returns a single user's rank + score without pulling the whole leaderboard.
 */
async function getUserRank(req, res) {
  try {
    const { userId } = req.params;
    const { scope = "global", gameId, period = "alltime" } = req.query;
    const key = resolveLeaderboardKey(scope, gameId, period);

    const [rank, score] = await Promise.all([
      redis.zrevrank(key, userId),
      redis.zscore(key, userId),
    ]);

    if (rank === null) {
      return res
        .status(404)
        .json({ error: "User has no score on this leaderboard yet" });
    }

    return res.json({
      userId,
      scope,
      gameId: gameId || null,
      period,
      rank: rank + 1,
      score: Number(score),
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error("getUserRank error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/leaderboard/around/:userId?scope=global|game&gameId=...&period=...&window=3
 * Returns the users ranked just above and below the given user ("around me" view).
 */
async function getAroundUser(req, res) {
  try {
    const { userId } = req.params;
    const { scope = "global", gameId, period = "alltime" } = req.query;
    const window = Math.min(parseInt(req.query.window || "3", 10), 25);
    const key = resolveLeaderboardKey(scope, gameId, period);

    const rank = await redis.zrevrank(key, userId);
    if (rank === null) {
      return res
        .status(404)
        .json({ error: "User has no score on this leaderboard yet" });
    }

    const start = Math.max(0, rank - window);
    const end = rank + window;
    const flat = await redis.zrevrange(key, start, end, "WITHSCORES");
    const leaderboard = await hydrate(flat, start);

    return res.json({
      userId,
      scope,
      gameId: gameId || null,
      period,
      rank: rank + 1,
      leaderboard,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error("getAroundUser error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/leaderboard/report?period=daily|weekly|monthly&limit=10
 * "Top Players Report" for a specific period, all-time falls back to global.
 */
async function getTopPlayersReport(req, res) {
  try {
    const { period = "weekly" } = req.query;
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 100);

    if (!["alltime", "daily", "weekly", "monthly"].includes(period)) {
      return res
        .status(400)
        .json({
          error: "period must be one of alltime, daily, weekly, monthly",
        });
    }

    const key = resolveLeaderboardKey("global", null, period);
    const flat = await redis.zrevrange(key, 0, limit - 1, "WITHSCORES");
    const topPlayers = await hydrate(flat, 0);

    return res.json({
      report: "top-players",
      period,
      generatedAt: new Date().toISOString(),
      count: topPlayers.length,
      topPlayers,
    });
  } catch (err) {
    console.error("getTopPlayersReport error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/leaderboard/games
 * List all game ids that have had at least one score submitted.
 */
async function listGames(req, res) {
  try {
    const games = await redis.smembers(keys.games);
    return res.json({ count: games.length, games });
  } catch (err) {
    console.error("listGames error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getLeaderboard,
  getUserRank,
  getAroundUser,
  getTopPlayersReport,
  listGames,
};
