"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShowtime = createShowtime;
exports.updateShowtime = updateShowtime;
exports.deleteShowtime = deleteShowtime;
exports.getShowtimeById = getShowtimeById;
exports.listShowtimes = listShowtimes;
exports.getShowtimeSeatMap = getShowtimeSeatMap;
const database_1 = require("../../db/database");
const AppError_1 = require("../../utils/AppError");
function getMovie(movieId) {
    const movie = database_1.db.prepare("SELECT * FROM movies WHERE id = ?").get(movieId);
    if (!movie)
        throw new AppError_1.AppError(400, "Movie does not exist");
    return movie;
}
function getScreen(screenId) {
    const screen = database_1.db
        .prepare("SELECT * FROM screens WHERE id = ?")
        .get(screenId);
    if (!screen)
        throw new AppError_1.AppError(400, "Screen does not exist");
    return screen;
}
/**
 * Prevents double-booking a screen: a new showtime cannot overlap in time
 * with any existing showtime on the same screen. Standard interval overlap
 * check: (StartA < EndB) AND (EndA > StartB).
 */
function assertNoScreenConflict(screenId, startTime, endTime, excludeShowtimeId) {
    let query = `
    SELECT id FROM showtimes
    WHERE screen_id = ?
      AND start_time < ?
      AND end_time > ?
  `;
    const params = [screenId, endTime, startTime];
    if (excludeShowtimeId) {
        query += " AND id != ?";
        params.push(excludeShowtimeId);
    }
    const conflict = database_1.db.prepare(query).get(...params);
    if (conflict) {
        throw new AppError_1.AppError(409, "This screen already has a showtime scheduled in that time range");
    }
}
function createShowtime(input) {
    const movie = getMovie(input.movie_id);
    getScreen(input.screen_id);
    const start = new Date(input.start_time);
    if (Number.isNaN(start.getTime()))
        throw new AppError_1.AppError(400, "Invalid start_time");
    const end = new Date(start.getTime() + movie.duration_minutes * 60000);
    assertNoScreenConflict(input.screen_id, start.toISOString(), end.toISOString());
    const info = database_1.db
        .prepare(`INSERT INTO showtimes (movie_id, screen_id, start_time, end_time, price) VALUES (?, ?, ?, ?, ?)`)
        .run(input.movie_id, input.screen_id, start.toISOString(), end.toISOString(), input.price);
    return getShowtimeById(info.lastInsertRowid);
}
function updateShowtime(id, input) {
    const existing = getShowtimeById(id);
    const movieId = input.movie_id ?? existing.movie_id;
    const screenId = input.screen_id ?? existing.screen_id;
    const movie = getMovie(movieId);
    getScreen(screenId);
    const start = input.start_time
        ? new Date(input.start_time)
        : new Date(existing.start_time);
    if (Number.isNaN(start.getTime()))
        throw new AppError_1.AppError(400, "Invalid start_time");
    const end = new Date(start.getTime() + movie.duration_minutes * 60000);
    assertNoScreenConflict(screenId, start.toISOString(), end.toISOString(), id);
    const price = input.price ?? existing.price;
    database_1.db.prepare(`UPDATE showtimes SET movie_id = ?, screen_id = ?, start_time = ?, end_time = ?, price = ? WHERE id = ?`).run(movieId, screenId, start.toISOString(), end.toISOString(), price, id);
    return getShowtimeById(id);
}
function deleteShowtime(id) {
    getShowtimeById(id);
    database_1.db.prepare("DELETE FROM showtimes WHERE id = ?").run(id);
}
function getShowtimeById(id) {
    const showtime = database_1.db
        .prepare(`SELECT s.*, m.title as movie_title, m.poster_url, m.duration_minutes, sc.name as screen_name
       FROM showtimes s
       JOIN movies m ON m.id = s.movie_id
       JOIN screens sc ON sc.id = s.screen_id
       WHERE s.id = ?`)
        .get(id);
    if (!showtime)
        throw new AppError_1.AppError(404, "Showtime not found");
    return showtime;
}
/** Lists showtimes for a given date (YYYY-MM-DD), optionally filtered by movie. */
function listShowtimes(filters) {
    let query = `
    SELECT s.*, m.title as movie_title, m.poster_url, m.duration_minutes, sc.name as screen_name
    FROM showtimes s
    JOIN movies m ON m.id = s.movie_id
    JOIN screens sc ON sc.id = s.screen_id
  `;
    const conditions = [];
    const params = [];
    if (filters.date) {
        conditions.push(`date(s.start_time) = date(?)`);
        params.push(filters.date);
    }
    if (filters.movie_id) {
        conditions.push(`s.movie_id = ?`);
        params.push(filters.movie_id);
    }
    if (conditions.length)
        query += " WHERE " + conditions.join(" AND ");
    query += " ORDER BY s.start_time ASC";
    return database_1.db.prepare(query).all(...params);
}
/** Returns the showtime plus every seat on its screen tagged as available/booked. */
function getShowtimeSeatMap(showtimeId) {
    const showtime = getShowtimeById(showtimeId);
    const seats = database_1.db
        .prepare(`SELECT
         seat.id, seat.row_label, seat.seat_number, seat.seat_type,
         CASE WHEN rs.id IS NULL THEN 0 ELSE 1 END as is_booked
       FROM seats seat
       LEFT JOIN reservation_seats rs
         ON rs.seat_id = seat.id AND rs.showtime_id = ?
       WHERE seat.screen_id = ?
       ORDER BY seat.row_label ASC, seat.seat_number ASC`)
        .all(showtimeId, showtime.screen_id);
    return { showtime, seats };
}
