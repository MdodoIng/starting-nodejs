const bcrypt = require("bcryptjs");
const { redis, keys } = require("../config/redis");
const { signToken } = require("../utils/jwt");

const USERNAME_RE = /^[a-zA-Z0-9]{3,20}/;

async function register(req, res) {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username and password are required" });
    }
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({
        error: "username must be 3-20 chars, letters/numbers/underscore only",
      });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "password must be at least 6 characters" });
    }
    const existingId = await redis.get(keys.usernameIndex(username));
    if (existingId) {
      return res.status(409).json({ error: "username already taken" });
    }
    const userId = await redis.incr(keys.userSeq);
    const passwordHash = await bcrypt.hash(password, 10);

    await redis
      .multi()
      .hset(keys.user(userId), {
        id: userId,
        username,
        email: email || "",
        passwordHash,
        createdAt: new Date().toISOString(),
      })
      .set(keys.usernameIndex(username), userId)
      .exec();

    const token = signToken({ sub: userId, username });
    return res.status(201).json({
      message: "User registered successfully",
      user: { id: userId, username, email: email || "" },
      token,
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username and password are required" });
    }
    const userId = await redis.get(keys.usernameIndex(username));
    if (!userId) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const user = await redis.hgetall(keys.user(userId));
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = signToken({ sub: userId, username: user.username });
    return res.json({
      message: "Login successful",
      user: { id: userId, username: user.username, email: user.email },
      token,
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function me(req, res) {
  try {
    const user = await redis.hgetall(keys.user(req.user.id));
    if (!user || !user.username) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({
      id: req.user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { register, login, me };
