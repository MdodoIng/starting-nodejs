# Leaderboard Frontend (Astro)

A lightweight, no-framework Astro frontend for the [Real-Time Leaderboard backend](../leaderboard-system).
Static-generated pages with small client-side scripts (vanilla JS + `socket.io-client`)
that talk to the backend's REST API and Socket.IO channel.

## Pages

- `/` — Global/game leaderboard viewer with **All-Time / Today / This Week / This Month** tabs and a live-updating indicator (Socket.IO).
- `/login` — Log in, stores the JWT in `localStorage`.
- `/register` — Create an account.
- `/submit` — Submit a score (`add` = cumulative points, `set` = only keep if it's a new high score). Requires login.
- `/profile` — Your global rank/score, an "around me" leaderboard slice, and recent score history.

## Setup

```bash
npm install
cp .env.example .env     # point PUBLIC_API_URL at your backend
npm run dev              # http://localhost:4321
```

Make sure the backend (`leaderboard-system`) is running first — see its README for setup with Redis.

```
PUBLIC_API_URL=http://localhost:3000
```

## Build for production

```bash
npm run build     # outputs static site to dist/
npm run preview   # preview the production build locally
```

## Notes

- Auth token + user info are stored in browser `localStorage` (this is a real deployed
  site, not a sandboxed preview, so that's the normal/expected approach here).
- The home page opens a Socket.IO connection to the backend and refreshes the visible
  leaderboard whenever any `leaderboard:update` event arrives — no polling needed.
- No UI framework (React/Vue) is used; every interactive bit is a small `<script type="module">`
  block per page, imported from `src/scripts/api.js`.
