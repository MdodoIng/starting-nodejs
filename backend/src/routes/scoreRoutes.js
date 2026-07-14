const express = require("express");
const { submitScore, getHistory } = require("../controllers/scoreController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, submitScore);
router.get("/history", requireAuth, getHistory);
router.get("/history/:userId", requireAuth, getHistory);

module.exports = router;
