const express = require("express");
const {
  getLeaderboard,
  getUserRank,
  getAroundUser,
  getTopPlayersReport,
  listGames,
} = require("../controllers/leaderboardController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Public: anyone can view leaderboards
router.get("/", getLeaderboard);
router.get("/games", listGames);
router.get("/report", getTopPlayersReport);

// Rank lookups require auth (kept simple: just needs a valid logged-in user)
router.get("/rank/:userId", requireAuth, getUserRank);
router.get("/around/:userId", requireAuth, getAroundUser);

module.exports = router;
