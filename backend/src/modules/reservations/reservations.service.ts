import { db, transaction } from "../../db/database";
import { AppError } from "../../utils/AppError";

interface CreateReservationInput {
  userId: number;
  showtimeId: number;
  seatIds: number[];
}

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
export function createReservation(input: CreateReservationInput) {
  const { userId, showtimeId, seatIds } = input;
  if (!seatIds.length)
    throw new AppError(400, "At least one seat must be selected");

  const uniqueSeatIds = Array.from(new Set(seatIds));

  const showtime = db
    .prepare("SELECT * FROM showtimes WHERE id = ?")
    .get(showtimeId) as
    | { id: number; screen_id: number; start_time: string; price: number }
    | undefined;
  if (!showtime) throw new AppError(404, "Showtime not found");

  if (new Date(showtime.start_time).getTime() <= Date.now()) {
    throw new AppError(
      400,
      "Cannot reserve seats for a showtime that has already started",
    );
  }

  const runReservation = transaction(() => {
    // Validate every seat belongs to this showtime's screen
    const placeholders = uniqueSeatIds.map(() => "?").join(", ");
    const validSeats = db
      .prepare(
        `SELECT id FROM seats WHERE screen_id = ? AND id IN (${placeholders})`,
      )
      .all(showtime.screen_id, ...uniqueSeatIds) as { id: number }[];

    if (validSeats.length !== uniqueSeatIds.length) {
      throw new AppError(
        400,
        "One or more seats do not belong to this showtime",
      );
    }

    // Check none of the requested seats are already booked for this showtime
    const alreadyBooked = db
      .prepare(
        `SELECT seat_id FROM reservation_seats WHERE showtime_id = ? AND seat_id IN (${placeholders})`,
      )
      .all(showtimeId, ...uniqueSeatIds) as { seat_id: number }[];

    if (alreadyBooked.length > 0) {
      throw new AppError(
        409,
        "One or more selected seats are already booked for this showtime",
        { seat_ids: alreadyBooked.map((r) => r.seat_id) },
      );
    }

    const totalAmount = showtime.price * uniqueSeatIds.length;

    const reservationInfo = db
      .prepare(
        `INSERT INTO reservations (user_id, showtime_id, status, total_amount) VALUES (?, ?, 'confirmed', ?)`,
      )
      .run(userId, showtimeId, totalAmount);
    const reservationId = reservationInfo.lastInsertRowid as number;

    const insertSeat = db.prepare(
      `INSERT INTO reservation_seats (reservation_id, showtime_id, seat_id) VALUES (?, ?, ?)`,
    );
    for (const seatId of uniqueSeatIds) {
      insertSeat.run(reservationId, showtimeId, seatId);
    }

    return reservationId;
  });

  const reservationId = runReservation();
  return getReservationById(reservationId);
}

export function getReservationById(id: number): any {
  const reservation = db
    .prepare("SELECT * FROM reservations WHERE id = ?")
    .get(id);
  if (!reservation) throw new AppError(404, "Reservation not found");
  const seats = db
    .prepare(
      `SELECT s.id, s.row_label, s.seat_number, s.seat_type
       FROM reservation_seats rs
       JOIN seats s ON s.id = rs.seat_id
       WHERE rs.reservation_id = ?`,
    )
    .all(id);
  return { ...(reservation as object), seats };
}

export function listReservationsForUser(userId: number) {
  const reservations = db
    .prepare(
      `SELECT r.*, s.start_time, s.end_time, m.title as movie_title, sc.name as screen_name
       FROM reservations r
       JOIN showtimes s ON s.id = r.showtime_id
       JOIN movies m ON m.id = s.movie_id
       JOIN screens sc ON sc.id = s.screen_id
       WHERE r.user_id = ?
       ORDER BY s.start_time DESC`,
    )
    .all(userId) as any[];

  const seatsStmt = db.prepare(
    `SELECT s.row_label, s.seat_number FROM reservation_seats rs
     JOIN seats s ON s.id = rs.seat_id WHERE rs.reservation_id = ?`,
  );
  return reservations.map((r) => ({ ...r, seats: seatsStmt.all(r.id) }));
}

/** Cancels a reservation. Only the owning user (or an admin) may cancel, and only if the showtime is still upcoming. */
export function cancelReservation(
  reservationId: number,
  requestingUser: { id: number; role: string },
) {
  const reservation = db
    .prepare(
      `SELECT r.*, s.start_time FROM reservations r
       JOIN showtimes s ON s.id = r.showtime_id
       WHERE r.id = ?`,
    )
    .get(reservationId) as
    | { id: number; user_id: number; status: string; start_time: string }
    | undefined;

  if (!reservation) throw new AppError(404, "Reservation not found");

  if (
    requestingUser.role !== "admin" &&
    reservation.user_id !== requestingUser.id
  ) {
    throw new AppError(403, "You can only cancel your own reservations");
  }

  if (reservation.status === "cancelled") {
    throw new AppError(400, "Reservation is already cancelled");
  }

  if (new Date(reservation.start_time).getTime() <= Date.now()) {
    throw new AppError(
      400,
      "Cannot cancel a reservation for a showtime that has already started",
    );
  }

  const cancelTx = transaction(() => {
    db.prepare(
      `UPDATE reservations SET status = 'cancelled', cancelled_at = datetime('now') WHERE id = ?`,
    ).run(reservationId);
    // Free up the seats immediately so others can book them
    db.prepare("DELETE FROM reservation_seats WHERE reservation_id = ?").run(
      reservationId,
    );
  });
  cancelTx();

  return getReservationById(reservationId);
}

/** Admin: list all reservations with optional filters. */
export function listAllReservations(filters: {
  showtime_id?: number;
  status?: string;
}) {
  let query = `
    SELECT r.*, u.name as user_name, u.email as user_email,
           s.start_time, s.end_time, m.title as movie_title, sc.name as screen_name
    FROM reservations r
    JOIN users u ON u.id = r.user_id
    JOIN showtimes s ON s.id = r.showtime_id
    JOIN movies m ON m.id = s.movie_id
    JOIN screens sc ON sc.id = s.screen_id
  `;
  const conditions: string[] = [];
  const params: any[] = [];
  if (filters.showtime_id) {
    conditions.push("r.showtime_id = ?");
    params.push(filters.showtime_id);
  }
  if (filters.status) {
    conditions.push("r.status = ?");
    params.push(filters.status);
  }
  if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY r.created_at DESC";

  return db.prepare(query).all(...params);
}
