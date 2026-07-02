import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { findByUsername, findById } from "./users.js";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = findByUsername(username);
    if (!user) return done(null, false, { message: "No such user" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return done(null, false, { message: "Wrong password" });

    return done(null, user);
  }),
);

// What goes INTO the session cookie (keep it small — just an id)
passport.serializeUser((user, done) => done(null, user.id));

// How to turn that id back into a full user on each request
passport.deserializeUser((id, done) => {
  const user = findById(id);
  done(null, user);
});

export default passport;
