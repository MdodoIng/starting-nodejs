const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "dev-secret-do-not-use-in-prod";
const EXPRESS_IN = process.env.JWT_SECRET_IN || "7d";

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPRESS_IN });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
