# Marquee — Movie Reservation Frontend

A React + TypeScript + Vite single-page app for the Movie Reservation System
API. Browse movies, pick a showtime, select seats on an interactive seat map,
manage your tickets, and (as an admin) manage movies, screens, showtimes,
users, and reports.

## Design

Dark "theater at night" palette — near-black indigo background, a marquee-bulb
gold accent for calls to action and selected seats, and a two-tone glow
(cool blue → soft violet) reserved for the cinema screen in the seat picker.
Display type is set in Anton (condensed, poster-like); body text in Inter;
prices, seat codes, and timestamps in IBM Plex Mono, ticket-stub style.

## Setup

Requires the [backend](../movie-reservation-system) running (default `http://localhost:3000`).

```bash
npm install
cp .env.example .env     # point VITE_API_URL at your API if not localhost:3000
npm run dev               # http://localhost:5173
```

`npm run build` produces a static `dist/` you can serve from any static host —
just make sure `VITE_API_URL` is set correctly at build time (Vite inlines
env vars into the build).

## Pages

| Route | Description |
|---|---|
| `/` | Browse movies — search, filter by genre |
| `/movies/:id` | Movie details, date picker, showtimes for that day |
| `/showtimes/:id/seats` | Interactive seat map + booking (requires login) |
| `/reservations` | Your tickets, cancel upcoming ones |
| `/login`, `/signup` | Auth |
| `/admin` | Admin only: Overview (revenue/capacity), Movies, Screens, Showtimes, Users |

## Notes

- Auth token is stored in `localStorage` and attached as `Authorization: Bearer <token>` on every request.
- If a seat you selected gets booked by someone else between loading the seat map and confirming (a race), the API returns 409 and the UI clears your selection and refreshes the map automatically.
- Admin routes in the UI are hidden (not just disabled) from non-admins, but the real enforcement is server-side — the API rejects them regardless of what the frontend shows.
