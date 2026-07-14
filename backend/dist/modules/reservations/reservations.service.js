"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservation = createReservation;
exports.getReservationById = getReservationById;
exports.listReservationsForUser = listReservationsForUser;
exports.cancelReservation = cancelReservation;
exports.listAllReservations = listAllReservations;
const database_1 = require("../../db/database");
const AppError_1 = require("../../utils/AppError");
/**
 * Creates a reservation for one or more seats on a showtime.
 *
 * Overbooking safety: everything below runs inside a single better-sqlite3
 * transaction. better-sqlite3 is synchronous, so no other JS code can
 * interleave with these statements - the "check seats are free" step and
 * the "insert the booking" step happen atomically from the app's point of
 * view. As a second line of defense, reservation_seats has a
 * UNIQUE(showtime_id, seat_id) constraint, so even a bug in this logic
 * could not result in the same seat being double-booked - the INSERT
 * would simply fail with a constraint error.
 */
function createReservation(input) {
    const { userId, showtimeId, seatIds } = input;
    if (!seatIds.length)
        throw new AppError_1.AppError(400, "At least one seat must be selected");
    const uniqueSeatIds = Array.from(new Set(seatIds));
    const showtime = database_1.db
        .prepare("SELECT * FROM showtimes WHERE id = ?")
        .get(showtimeId);
    if (!showtime)
        throw new AppError_1.AppError(404, "Showtime not found");
    if (new Date(showtime.start_time).getTime() <= Date.now()) {
        throw new AppError_1.AppError(400, "Cannot reserve seats for a showtime that has already started");
    }
    const runReservation = (0, database_1.transaction)(() => {
        // Validate every seat belongs to this showtime's screen
        const placeholders = uniqueSeatIds.map(() => "?").join(", ");
        const validSeats = database_1.db
            .prepare(`SELECT id FROM seats WHERE screen_id = ? AND id IN (${placeholders})`)
            .all(showtime.screen_id, ...uniqueSeatIds);
        if (validSeats.length !== uniqueSeatIds.length) {
            throw new AppError_1.AppError(400, "One or more seats do not belong to this showtime");
        }
        // Check none of the requested seats are already booked for this showtime
        const alreadyBooked = database_1.db
            .prepare(`SELECT seat_id FROM reservation_seats WHERE showtime_id = ? AND seat_id IN (${placeholders})`)
            .all(showtimeId, ...uniqueSeatIds);
        if (alreadyBooked.length > 0) {
            throw new AppError_1.AppError(409, "One or more selected seats are already booked for this showtime", { seat_ids: alreadyBooked.map((r) => r.seat_id) });
        }
        const totalAmount = showtime.price * uniqueSeatIds.length;
        const reservationInfo = database_1.db
            .prepare(`INSERT INTO reservations (user_id, showtime_id, status, total_amount, payment_method) VALUES (?, ?, 'confirmed', ?, ?)`)
            .run(userId, showtimeId, totalAmount, input.paymentMethod);
        const reservationId = reservationInfo.lastInsertRowid;
        const insertSeat = database_1.db.prepare(`INSERT INTO reservation_seats (reservation_id, showtime_id, seat_id) VALUES (?, ?, ?)`);
        for (const seatId of uniqueSeatIds) {
            insertSeat.run(reservationId, showtimeId, seatId);
        }
        return reservationId;
    });
    const reservationId = runReservation();
    return getReservationById(reservationId);
}
function getReservationById(id) {
    const reservation = database_1.db
        .prepare("SELECT * FROM reservations WHERE id = ?")
        .get(id);
    if (!reservation)
        throw new AppError_1.AppError(404, "Reservation not found");
    const seats = database_1.db
        .prepare(`SELECT s.id, s.row_label, s.seat_number, s.seat_type
       FROM reservation_seats rs
       JOIN seats s ON s.id = rs.seat_id
       WHERE rs.reservation_id = ?`)
        .all(id);
    return { ...reservation, seats };
}
function listReservationsForUser(userId) {
    const reservations = database_1.db
        .prepare(`SELECT r.*, s.start_time, s.end_time, m.title as movie_title, sc.name as screen_name
       FROM reservations r
       JOIN showtimes s ON s.id = r.showtime_id
       JOIN movies m ON m.id = s.movie_id
       JOIN screens sc ON sc.id = s.screen_id
       WHERE r.user_id = ?
       ORDER BY s.start_time DESC`)
        .all(userId);
    const seatsStmt = database_1.db.prepare(`SELECT s.row_label, s.seat_number FROM reservation_seats rs
     JOIN seats s ON s.id = rs.seat_id WHERE rs.reservation_id = ?`);
    return reservations.map((r) => ({ ...r, seats: seatsStmt.all(r.id) }));
}
/** Cancels a reservation. Only the owning user (or an admin) may cancel, and only if the showtime is still upcoming. */
function cancelReservation(reservationId, requestingUser) {
    const reservation = database_1.db
        .prepare(`SELECT r.*, s.start_time FROM reservations r
       JOIN showtimes s ON s.id = r.showtime_id
       WHERE r.id = ?`)
        .get(reservationId);
    if (!reservation)
        throw new AppError_1.AppError(404, "Reservation not found");
    if (requestingUser.role !== "admin" &&
        reservation.user_id !== requestingUser.id) {
        throw new AppError_1.AppError(403, "You can only cancel your own reservations");
    }
    if (reservation.status === "cancelled") {
        throw new AppError_1.AppError(400, "Reservation is already cancelled");
    }
    if (new Date(reservation.start_time).getTime() <= Date.now()) {
        throw new AppError_1.AppError(400, "Cannot cancel a reservation for a showtime that has already started");
    }
    const cancelTx = (0, database_1.transaction)(() => {
        database_1.db.prepare(`UPDATE reservations SET status = 'cancelled', cancelled_at = datetime('now') WHERE id = ?`).run(reservationId);
        // Free up the seats immediately so others can book them
        database_1.db.prepare("DELETE FROM reservation_seats WHERE reservation_id = ?").run(reservationId);
    });
    cancelTx();
    return getReservationById(reservationId);
}
/** Admin: list all reservations with optional filters. */
function listAllReservations(filters) {
    let query = `
    SELECT r.*, u.name as user_name, u.email as user_email,
           s.start_time, s.end_time, m.title as movie_title, sc.name as screen_name
    FROM reservations r
    JOIN users u ON u.id = r.user_id
    JOIN showtimes s ON s.id = r.showtime_id
    JOIN movies m ON m.id = s.movie_id
    JOIN screens sc ON sc.id = s.screen_id
  `;
    const conditions = [];
    const params = [];
    if (filters.showtime_id) {
        conditions.push("r.showtime_id = ?");
        params.push(filters.showtime_id);
    }
    if (filters.status) {
        conditions.push("r.status = ?");
        params.push(filters.status);
    }
    if (conditions.length)
        query += " WHERE " + conditions.join(" AND ");
    query += " ORDER BY r.created_at DESC";
    return database_1.db.prepare(query).all(...params);
}
