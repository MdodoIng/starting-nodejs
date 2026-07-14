const { verifyToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [schema, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error:
        "Missing or malformed Authorization header. Expected: Bearer <token>",
    });
  }
  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.sub, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
