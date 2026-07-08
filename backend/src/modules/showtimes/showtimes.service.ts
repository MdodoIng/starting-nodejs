import { db } from "../../db/database";
import { AppError } from "../../utils/AppError";

interface ShowtimeInput {
  movie_id: number;
  screen_id: number;
  start_time: string; // ISO
  price: number;
}

function getMovie(movieId: number) {
  const movie = db.prepare("SELECT * FROM movies WHERE id = ?").get(movieId) as
    | { id: number; duration_minutes: number }
    | undefined;
  if (!movie) throw new AppError(400, "Movie does not exist");
  return movie;
}

function getScreen(screenId: number) {
  const screen = db
    .prepare("SELECT * FROM screens WHERE id = ?")
    .get(screenId) as { id: number } | undefined;

  if (!screen) throw new AppError(400, "Screen does not exist");
  return screen;
}

/**
 * Prevents double-booking a screen: a new showtime cannot overlap in time
 * with any existing showtime on the same screen. Standard interval overlap
 * check: (StartA < EndB) AND (EndA > StartB).
 */
function assertNoScreenConflict(
  screenId: number,
  startTime: string,
  endTime: string,
  excludeShowtimeId?: number,
) {
  let query = `
    SELECT id FROM showtimes
    WHERE screen_id = ?
      AND start_time < ?
      AND end_time > ?
  `;
  const params: any[] = [screenId, endTime, startTime];
  if (excludeShowtimeId) {
    query += " AND id != ?";
    params.push(excludeShowtimeId);
  }
  const conflict = db.prepare(query).get(...params);
  if (conflict) {
    throw new AppError(
      409,
      "This screen already has a showtime scheduled in that time range",
    );
  }
}

export function createShowtime(input: ShowtimeInput) {
  const movie = getMovie(input.movie_id);
  getScreen(input.screen_id);

  const start = new Date(input.start_time);
  if (Number.isNaN(start.getTime()))
    throw new AppError(400, "Invalid start_time");
  const end = new Date(start.getTime() + movie.duration_minutes * 60000);

  assertNoScreenConflict(
    input.screen_id,
    start.toISOString(),
    end.toISOString(),
  );

  const info = db
    .prepare(
      `INSERT INTO showtimes (movie_id, screen_id, start_time, end_time, price) VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      input.movie_id,
      input.screen_id,
      start.toISOString(),
      end.toISOString(),
      input.price,
    );

  return getShowtimeById(info.lastInsertRowid as number);
}

export function updateShowtime(id: number, input: Partial<ShowtimeInput>) {
  const existing = getShowtimeById(id);
  const movieId = input.movie_id ?? existing.movie_id;
  const screenId = input.screen_id ?? existing.screen_id;
  const movie = getMovie(movieId);
  getScreen(screenId);

  const start = input.start_time
    ? new Date(input.start_time)
    : new Date(existing.start_time);

  if (Number.isNaN(start.getTime()))
    throw new AppError(400, "Invalid start_time");
  const end = new Date(start.getTime() + movie.duration_minutes * 60000);

  assertNoScreenConflict(screenId, start.toISOString(), end.toISOString(), id);

  const price = input.price ?? existing.price;

  db.prepare(
    `UPDATE showtimes SET movie_id = ?, screen_id = ?, start_time = ?, end_time = ?, price = ? WHERE id = ?`,
  ).run(movieId, screenId, start.toISOString(), end.toISOString(), price, id);

  return getShowtimeById(id);
}

export function deleteShowtime(id: number) {
  getShowtimeById(id);
  db.prepare("DELETE FROM showtimes WHERE id = ?").run(id);
}

export function getShowtimeById(id: number): any {
  const showtime = db
    .prepare(
      `SELECT s.*, m.title as movie_title, m.poster_url, m.duration_minutes, sc.name as screen_name
       FROM showtimes s
       JOIN movies m ON m.id = s.movie_id
       JOIN screens sc ON sc.id = s.screen_id
       WHERE s.id = ?`,
    )
    .get(id);
  if (!showtime) throw new AppError(404, "Showtime not found");
  return showtime;
}

/** Lists showtimes for a given date (YYYY-MM-DD), optionally filtered by movie. */
export function listShowtimes(filters: { date?: string; movie_id?: number }) {
  let query = `
    SELECT s.*, m.title as movie_title, m.poster_url, m.duration_minutes, sc.name as screen_name
    FROM showtimes s
    JOIN movies m ON m.id = s.movie_id
    JOIN screens sc ON sc.id = s.screen_id
  `;
  const conditions: string[] = [];
  const params: any[] = [];
  if (filters.date) {
    conditions.push(`date(s.start_time) = date(?)`);
    params.push(filters.date);
  }
  if (filters.movie_id) {
    conditions.push(`s.movie_id = ?`);
    params.push(filters.movie_id);
  }
  if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY s.start_time ASC";
  return db.prepare(query).all(...params);
}

/** Returns the showtime plus every seat on its screen tagged as available/booked. */
export function getShowtimeSeatMap(showtimeId: number) {
  const showtime = getShowtimeById(showtimeId);

  const seats = db
    .prepare(
      `SELECT
         seat.id, seat.row_label, seat.seat_number, seat.seat_type,
         CASE WHEN rs.id IS NULL THEN 0 ELSE 1 END as is_booked
       FROM seats seat
       LEFT JOIN reservation_seats rs
         ON rs.seat_id = seat.id AND rs.showtime_id = ?
       WHERE seat.screen_id = ?
       ORDER BY seat.row_label ASC, seat.seat_number ASC`,
    )
    .all(showtimeId, showtime.screen_id);

  return { showtime, seats };
}
