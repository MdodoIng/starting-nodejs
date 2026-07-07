# Movie Reservation System

A backend API for browsing movies, scheduling showtimes, and reserving seats -
built with **Node.js, Express, TypeScript**, and **SQLite** (via Node's
built-in `node:sqlite` module, so there's nothing to compile).

## Requirements

- **Node.js >= 22.5.0** (needed for the built-in `node:sqlite` module). Check with `node -v`.

> Why not `better-sqlite3`? It requires a native build step. `node:sqlite` ships
> with Node itself, is synchronous just like `better-sqlite3` (which matters for
> the transaction logic below), and needs zero native compilation.

## Setup

```bash
npm install
cp .env.example .env        # edit JWT_SECRET etc. if you like
npm run setup                # creates the schema and seeds demo data
npm run dev                  # starts the API on http://localhost:3000
```

`npm run setup` runs the migration then the seed script, which creates:
- An **admin** user: `admin@cinema.com` / `Admin123!` (change via `.env`)
- 6 genres, 2 screens (with full seat grids), 4 movies, and ~36 showtimes over the next 3 days

Other useful scripts:
- `npm run build` / `npm start` - compile and run the production build
- `npm run migrate` - (re)apply the schema (idempotent, safe to re-run)
- `npm run seed` - (re)seed demo data (safe to re-run, skips what already exists)

## Data model

```
users            (id, name, email, password_hash, role[admin|user])
genres           (id, name)
movies           (id, title, description, poster_url, duration_minutes)
movie_genres     (movie_id, genre_id)                    -- many-to-many
screens          (id, name, rows, columns)
seats            (id, screen_id, row_label, seat_number, seat_type[standard|vip])
showtimes        (id, movie_id, screen_id, start_time, end_time, price)
reservations     (id, user_id, showtime_id, status[confirmed|cancelled], total_amount)
reservation_seats(id, reservation_id, showtime_id, seat_id)  -- UNIQUE(showtime_id, seat_id)
```

Key relationships:
- A **movie** has many **genres** (and vice versa) via `movie_genres`.
- A **screen** has many **seats**, generated automatically when the screen is created (the back two rows default to `vip`).
- A **showtime** ties a movie to a screen at a start time; `end_time` is always derived from the movie's `duration_minutes`, never entered manually.
- A **reservation** holds one or more **seats** for one **showtime**, via `reservation_seats`.

## How overbooking is prevented

Two layers, so a bug in one doesn't mean double-booked seats:

1. **Transactional check-then-insert.** `node:sqlite` (like `better-sqlite3`) is
   synchronous, and Node is single-threaded, so wrapping the "are these seats
   free?" check and the "insert the reservation" step in one `BEGIN
   IMMEDIATE ... COMMIT` transaction (see `src/db/database.ts`'s `transaction()`
   helper) means no other request can interleave in between. See
   `reservations.service.ts::createReservation`.
2. **A database constraint as a backstop.** `reservation_seats` has
   `UNIQUE(showtime_id, seat_id)`. Even if application logic had a bug, the
   database itself refuses to store the same seat twice for the same
   showtime - the `INSERT` fails with a constraint error instead of silently
   succeeding.

Cancelling a reservation **deletes** its rows from `reservation_seats`
(instead of just flagging them), which immediately frees those seats for
others - while the `reservations` row itself is kept (`status = 'cancelled'`)
for history/reporting.

## How scheduling conflicts are prevented

A screen can only show one thing at a time. When a showtime is created or
updated, `showtimes.service.ts` runs a classic interval-overlap check
(`StartA < EndB AND EndA > StartB`) against every other showtime on that
screen and rejects the request (`409`) if it overlaps.

## Auth & roles

- Passwords are hashed with `bcryptjs`; sessions are stateless JWTs (`Authorization: Bearer <token>`).
- Two roles: `user` (default on signup) and `admin`.
- The **first** admin comes from seed data (`npm run seed`). From then on, only
  an existing admin can promote another user via `PATCH /api/users/:id/promote` -
  there's no self-service way to become admin.

## API reference

All endpoints are prefixed with `/api`. Endpoints marked 🔒 require a Bearer
token; 🔒👑 require the token's user to be an `admin`.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup` | Create a `user` account → `{ user, token }` |
| POST | `/auth/login` | Log in → `{ user, token }` |
| GET🔒 | `/auth/me` | Current user's profile |

### Users
| Method | Path | Description |
|---|---|---|
| GET🔒👑 | `/users` | List all users |
| PATCH🔒👑 | `/users/:id/promote` | Promote a user to admin |

### Genres
| Method | Path | Description |
|---|---|---|
| GET | `/genres` | List genres |
| POST🔒👑 | `/genres` | Create a genre `{ name }` |

### Movies
| Method | Path | Description |
|---|---|---|
| GET | `/movies?genre=&search=` | List movies (filter by genre name / title search) |
| GET | `/movies/:id` | Movie details incl. genres |
| POST🔒👑 | `/movies` | `{ title, description?, poster_url?, duration_minutes, genre_ids? }` |
| PATCH🔒👑 | `/movies/:id` | Partial update, same shape |
| DELETE🔒👑 | `/movies/:id` | Delete a movie |

### Screens
| Method | Path | Description |
|---|---|---|
| GET | `/screens` | List screens |
| GET | `/screens/:id` | Screen + full seat list |
| POST🔒👑 | `/screens` | `{ name, rows, columns }` - seats auto-generated |
| DELETE🔒👑 | `/screens/:id` | Delete a screen (cascades to its seats/showtimes) |

### Showtimes
| Method | Path | Description |
|---|---|---|
| GET | `/showtimes?date=YYYY-MM-DD&movie_id=` | List showtimes, optionally filtered |
| GET | `/showtimes/:id` | Showtime details |
| GET | `/showtimes/:id/seats` | Seat map with `is_booked` per seat |
| POST🔒👑 | `/showtimes` | `{ movie_id, screen_id, start_time, price }` - `end_time` is computed |
| PATCH🔒👑 | `/showtimes/:id` | Partial update, re-checks conflicts |
| DELETE🔒👑 | `/showtimes/:id` | Delete a showtime |

### Reservations
| Method | Path | Description |
|---|---|---|
| POST🔒 | `/reservations` | `{ showtime_id, seat_ids: number[] }` → creates a reservation |
| GET🔒 | `/reservations/me` | Your own reservations (with seats) |
| PATCH🔒 | `/reservations/:id/cancel` | Cancel (only if upcoming, only yours or admin) |
| GET🔒👑 | `/reservations?showtime_id=&status=` | All reservations (admin) |

### Reports (admin only)
| Method | Path | Description |
|---|---|---|
| GET🔒👑 | `/reports/summary` | Total revenue, confirmed reservations, tickets sold, upcoming showtimes |
| GET🔒👑 | `/reports/revenue?from=&to=` | Revenue + reservation count per movie |
| GET🔒👑 | `/reports/capacity?showtime_id=` | Total/booked seats and utilization % per showtime |

## Example flow (curl)

```bash
# Log in as the seeded admin
curl -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@cinema.com","password":"Admin123!"}'
# -> copy the "token" value

# Sign up a regular user
curl -X POST localhost:3000/api/auth/signup -H 'Content-Type: application/json' \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"password123"}'

# Browse today's showtimes
curl "localhost:3000/api/showtimes?date=$(date +%F)"

# Check seat availability for showtime 1
curl localhost:3000/api/showtimes/1/seats

# Reserve seats 1 and 2 as Jane
curl -X POST localhost:3000/api/reservations -H "Authorization: Bearer <JANE_TOKEN>" \
  -H 'Content-Type: application/json' -d '{"showtime_id":1,"seat_ids":[1,2]}'

# Cancel it
curl -X PATCH localhost:3000/api/reservations/1/cancel -H "Authorization: Bearer <JANE_TOKEN>"
```

## Project structure

```
src/
  db/                 schema.sql, migrate.ts, seed.ts, database.ts (connection + transaction helper)
  middleware/          auth.ts (JWT + role guard), validate.ts (zod), errorHandler.ts
  utils/               jwt.ts, AppError.ts, asyncHandler.ts
  modules/
    auth/              signup, login, me
    users/              admin: list users, promote to admin
    genres/              list/create genres
    movies/              CRUD + genre linking + filtering
    screens/             create screens (auto seat generation), list, delete
    showtimes/          scheduling (conflict checks), seat maps
    reservations/       booking (overbooking-safe), cancellation, admin listing
    reports/             summary, revenue by movie, capacity/utilization
  index.ts              app wiring
```

## Possible extensions

- Payment integration (Stripe) before confirming a reservation
- Email confirmations/reminders (e.g. via a queue + nodemailer)
- Seat holds with a short TTL (e.g. "seat reserved for 10 minutes while you pay")
  instead of the current immediate-confirm model
- Pagination on list endpoints
- Refresh tokens / token revocation
