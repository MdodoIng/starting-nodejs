# Real-Time Leaderboard System

A backend service for ranking and scoring users across games/activities, built with
**Node.js + Express**, **Redis Sorted Sets**, **JWT auth**, and **Socket.IO** for real-time push updates.

## Features

- **User Authentication** — register/login with bcrypt-hashed passwords + JWT tokens.
- **Score Submission** — additive ("total points") or high-score ("best score") modes.
- **Real-Time Leaderboard Updates** — Socket.IO broadcasts on every score change.
- **User Rankings** — O(log N) rank + score lookups, plus an "around me" view.
- **Top Players Report** — daily / weekly / monthly / all-time reports.
- **Score History** — capped, timestamped history per user.

## Why Redis Sorted Sets

A [sorted set](https://redis.io/docs/data-types/sorted-sets/) (ZSET) keeps members ordered
by score automatically, backed by a skip list. That gives us, all in O(log N):

| Need                              | Redis command                     |
|------------------------------------|------------------------------------|
| Add / increment a score            | `ZINCRBY` / `ZADD ... GT`          |
| Get a user's rank                  | `ZREVRANK`                         |
| Get a user's score                 | `ZSCORE`                           |
| Top N players                      | `ZREVRANGE 0 N-1 WITHSCORES`       |
| Players "around" a given user      | `ZREVRANGE rank-k rank+k WITHSCORES` |
| Leaderboard size                   | `ZCARD`                            |

## Data Model

```
user:{id}                  HASH    username, email, passwordHash, createdAt
username:{username}        STRING  -> userId                 (unique lookup / login)
user:id:seq                STRING  auto-increment counter

leaderboard:global         ZSET    member=userId  score=all-time total
leaderboard:game:{gameId}  ZSET    member=userId  score=total for that game
leaderboard:daily:{date}   ZSET    member=userId  score=points that day    (TTL ~3 days)
leaderboard:weekly:{wk}    ZSET    member=userId  score=points that week   (TTL ~3 weeks)
leaderboard:monthly:{mo}   ZSET    member=userId  score=points that month  (TTL ~3 months)

history:{userId}           ZSET    member=JSON entry  score=timestamp (capped at HISTORY_LIMIT)
games                      SET     known game ids
```

Periodic leaderboards (daily/weekly/monthly) are separate keys with a TTL, so Redis
expires them automatically instead of needing a cron cleanup job.

## Project Structure

```
src/
  server.js                 Express app + Socket.IO wiring + route mounting
  config/redis.js           Redis client + centralized key-naming scheme
  middleware/auth.js        JWT bearer-token verification middleware
  utils/jwt.js              sign/verify helpers
  utils/period.js           daily/weekly/monthly bucket key + TTL helpers
  utils/seed.js             populates demo users + scores for quick testing
  controllers/
    authController.js       register / login / me
    scoreController.js      submitScore / getHistory
    leaderboardController.js  getLeaderboard / getUserRank / getAroundUser / getTopPlayersReport / listGames
  routes/
    authRoutes.js
    scoreRoutes.js
    leaderboardRoutes.js
```

## Setup

```bash
npm install
cp .env.example .env        # edit JWT_SECRET etc.
# make sure Redis is running locally, e.g.:
#   docker run -p 6379:6379 redis:7
npm run seed                # optional: populate demo data
npm start                   # or `npm run dev` with nodemon
```

Server listens on `http://localhost:3000` by default. Health check: `GET /health`.

## API Reference

All request/response bodies are JSON. Authenticated routes require:
`Authorization: Bearer <token>`.

### Auth

**Register**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123","email":"alice@example.com"}'
```

**Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'
```
Response includes a `token` — use it as `Authorization: Bearer <token>` below.

**Current user**
```bash
curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <token>"
```

### Scores

**Submit a score** (`mode: "add"` accumulates points, `"set"` only keeps it if it's a new high score)
```bash
curl -X POST http://localhost:3000/api/scores \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"gameId":"space-invaders","score":250,"mode":"add"}'
```
Response includes the user's updated global + per-game rank and score, and also
triggers a `leaderboard:update` Socket.IO event to subscribed clients.

**Score history**
```bash
curl "http://localhost:3000/api/scores/history?limit=20" -H "Authorization: Bearer <token>"
```

### Leaderboards

**Top N** (`scope=global|game`, `period=alltime|daily|weekly|monthly`)
```bash
curl "http://localhost:3000/api/leaderboard?scope=global&period=alltime&limit=10"
curl "http://localhost:3000/api/leaderboard?scope=game&gameId=space-invaders&limit=10"
```

**A specific user's rank**
```bash
curl http://localhost:3000/api/leaderboard/rank/3?scope=global \
  -H "Authorization: Bearer <token>"
```

**"Around me" view** (players ranked near a given user)
```bash
curl "http://localhost:3000/api/leaderboard/around/3?window=3" \
  -H "Authorization: Bearer <token>"
```

**Top Players Report** (for a specific period)
```bash
curl "http://localhost:3000/api/leaderboard/report?period=weekly&limit=10"
```

**List known games**
```bash
curl http://localhost:3000/api/leaderboard/games
```

### Real-Time Updates (Socket.IO)

```js
const socket = io('http://localhost:3000');
socket.emit('subscribe:global');
socket.emit('subscribe:game', 'space-invaders');
socket.on('leaderboard:update', (payload) => {
  console.log('leaderboard changed:', payload);
});
```

## Notes / Production Considerations

- Swap the in-memory rate limiter store for a Redis-backed one if you scale to
  multiple server instances (so limits are shared, not per-process).
- `JWT_SECRET` **must** be changed and kept out of source control in real deployments.
- For very large leaderboards, paginate with `limit`/`offset` (already supported)
  rather than pulling the full sorted set.
- Consider `ZADD GT CH` if you want to know whether a "set"-mode submission actually
  changed the stored score (useful for "new high score!" notifications).
