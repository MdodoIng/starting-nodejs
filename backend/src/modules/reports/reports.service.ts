import { db } from "../../db/database";

/** Overall summary: total revenue, total reservations, total tickets sold. */
export function getSummary() {
  const revenue = db
    .prepare(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM reservations WHERE status = 'confirmed'`,
    )
    .get() as { total_revenue: number };

  const reservationCount = db
    .prepare(
      `SELECT COUNT(*) as count FROM reservations WHERE status = 'confirmed'`,
    )
    .get() as { count: number };

  const ticketsSold = db
    .prepare(
      `SELECT COUNT(*) as count FROM reservation_seats rs
       JOIN reservations r ON r.id = rs.reservation_id
       WHERE r.status = 'confirmed'`,
    )
    .get() as { count: number };

  const upcomingShowtimes = db
    .prepare(
      `SELECT COUNT(*) as count FROM showtimes WHERE start_time > datetime('now')`,
    )
    .get() as { count: number };

  return {
    total_revenue: revenue.total_revenue,
    confirmed_reservations: reservationCount.count,
    tickets_sold: ticketsSold.count,
    upcoming_showtimes: upcomingShowtimes.count,
  };
}

/** Revenue broken down per movie, optionally within a date range (applied to showtime start_time). */
export function getRevenueByMovie(filters: { from?: string; to?: string }) {
  let query = `
    SELECT m.id as movie_id, m.title, 
           COALESCE(SUM(r.total_amount), 0) as revenue,
           COUNT(r.id) as reservation_count
    FROM movies m
    LEFT JOIN showtimes s ON s.movie_id = m.id
    LEFT JOIN reservations r ON r.showtime_id = s.id AND r.status = 'confirmed'
  `;
  const conditions: string[] = [];
  const params: any[] = [];
  if (filters.from) {
    conditions.push("s.start_time >= ?");
    params.push(filters.from);
  }
  if (filters.to) {
    conditions.push("s.start_time <= ?");
    params.push(filters.to);
  }
  if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  query += " GROUP BY m.id, m.title ORDER BY revenue DESC";

  return db.prepare(query).all(...params);
}

/** Capacity utilization per showtime: total seats, booked seats, utilization %. */
export function getCapacityReport(filters: { showtime_id?: number }) {
  let query = `
    SELECT
      s.id as showtime_id,
      m.title as movie_title,
      sc.name as screen_name,
      s.start_time,
      (SELECT COUNT(*) FROM seats WHERE screen_id = s.screen_id) as total_seats,
      (SELECT COUNT(*) FROM reservation_seats WHERE showtime_id = s.id) as booked_seats
    FROM showtimes s
    JOIN movies m ON m.id = s.movie_id
    JOIN screens sc ON sc.id = s.screen_id
  `;
  const params: any[] = [];
  if (filters.showtime_id) {
    query += " WHERE s.id = ?";
    params.push(filters.showtime_id);
  }
  query += " ORDER BY s.start_time ASC";

  const rows = db.prepare(query).all(...params) as any[];
  return rows.map((row) => ({
    ...row,
    utilization_percent:
      row.total_seats > 0
        ? Math.round((row.booked_seats / row.total_seats) * 1000) / 10
        : 0,
  }));
}
