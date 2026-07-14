# Movie Reservation System

This repository is a full-stack Movie Reservation System with:
- `backend/` — Node.js + Express + TypeScript API using SQLite
- `frondend/` — React + TypeScript + Vite SPA for browsing movies, selecting seats, and managing reservations

> Note: the frontend folder is named `frondend/` in this repository.

## Repository structure

- `backend/` — API server, database migration/seed scripts, auth, movie/showtime/reservation management
- `frondend/` — client app, auth flow, seat picker, admin dashboards

## Getting started

### 1. Start the backend

```bash
cd backend
npm install
npm run setup
npm run dev
```

The API should start on `http://localhost:3000`.

### 2. Start the frontend

In a separate terminal:

```bash
cd frondend
npm install
npm run dev
```

The frontend should start on `http://localhost:5173` (or the port shown by Vite).

## Available docs

- `backend/README.md` — backend API details, data model and endpoints
- `frondend/README.md` — frontend app overview and routes

## Notes

- The backend uses SQLite and includes seed data for a demo admin account.
- The frontend expects the backend API to be available at `http://localhost:3000` by default.

## Useful commands

From `backend/`:
- `npm run setup` — create schema and seed demo data
- `npm run dev` — start backend in development
- `npm run migrate` — apply database schema
- `npm run seed` — seed demo data

From `frondend/`:
- `npm run dev` — start the Vite app
- `npm run build` — build the production bundle

## License

This repository does not include a license file.
