-- =========================================================
-- Movie Reservation System - Schema
-- =========================================================
PRAGMA foreign_keys = ON;
-- ---------------------------------------------------------
-- Users & Roles
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- ---------------------------------------------------------
-- Genres (many-to-many with movies)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS genres (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
-- ---------------------------------------------------------
-- Movies
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS movie_genres (
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, genre_id)
);
-- ---------------------------------------------------------
-- Screens (theater rooms) & Seats
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS screens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  rows INTEGER NOT NULL CHECK (rows > 0),
  columns INTEGER NOT NULL CHECK (columns > 0)
);
CREATE TABLE IF NOT EXISTS seats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  screen_id INTEGER NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  row_label TEXT NOT NULL,
  -- 'A', 'B', 'C', ...
  seat_number INTEGER NOT NULL,
  -- 1, 2, 3, ...
  seat_type TEXT NOT NULL CHECK (seat_type IN ('standard', 'vip')) DEFAULT 'standard',
  UNIQUE (screen_id, row_label, seat_number)
);
-- ---------------------------------------------------------
-- Showtimes
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS showtimes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  screen_id INTEGER NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  start_time TEXT NOT NULL,
  -- ISO 8601
  end_time TEXT NOT NULL,
  -- computed from movie duration
  price REAL NOT NULL CHECK (price >= 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_showtimes_movie ON showtimes(movie_id);
CREATE INDEX IF NOT EXISTS idx_showtimes_screen_time ON showtimes(screen_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_showtimes_start_time ON showtimes(start_time);
-- ---------------------------------------------------------
-- Reservations & Reservation Seats
--
-- A reservation belongs to a user + showtime, and holds one or more seats.
-- reservation_seats rows only exist for ACTIVE holds: on cancellation we
-- delete the seat rows (keeping the reservation record for history with
-- status='cancelled'). The UNIQUE(showtime_id, seat_id) constraint below
-- is what makes overbooking impossible at the database level - two active
-- reservations can never hold the same seat for the same showtime.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  showtime_id INTEGER NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled')) DEFAULT 'confirmed',
  total_amount REAL NOT NULL CHECK (total_amount >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cash', 'paypal')) DEFAULT 'card',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  cancelled_at TEXT
);
CREATE TABLE IF NOT EXISTS reservation_seats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  showtime_id INTEGER NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
  seat_id INTEGER NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  UNIQUE (showtime_id, seat_id)
);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_showtime ON reservations(showtime_id);
CREATE INDEX IF NOT EXISTS idx_reservation_seats_reservation ON reservation_seats(reservation_id);