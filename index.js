import express from "express";
import session from "express-session";
import passport from "./auth.js";
import { createUser, findByUsername } from "./users.js";
import bcrypt from "bcrypt";
import { Strategy as GitHubStrategy } from "passport-github2";

const app = express();
app.use(express.json());

app.use(
  session({
    secret: "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // look up or create a local user based on profile.id, same idea as Step 4
      done(null, { id: profile.id, username: profile.username });
    },
  ),
);

app.get("/", (req, res) => res.send("Hello"));

app.get("/auth/github", passport.authenticate("github"));
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => res.redirect("/profile"),
);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (findByUsername(username)) {
    return res.status(409).json({ error: "Username taken" });
  }
  const hash = await bcrypt.hash(password, 10);
  createUser(username, hash);
  res.json({ ok: true });
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message });
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({ ok: true, user: user.username });
    });
  })(req, res, next);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Not logged in" });
}

app.get("/profile", ensureAuthenticated, (req, res) => {
  res.json({ username: req.user.username });
});

app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.json({ ok: true });
  });
});

app.listen(3000, () => console.log("Running on http://localhost:3000"));
