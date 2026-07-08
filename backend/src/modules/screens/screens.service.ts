import { db, transaction } from "../../db/database";
import { AppError } from "../../utils/AppError";

export function listScreens() {
  return db.prepare("SELECT * FROM screens ORDER BY name ASC").all();
}

export function getScreenWithSeats(id: number) {
  const screen = db.prepare("SELECT * FROM screens WHERE id = ?").get(id);
  if (!screen) throw new AppError(404, "Screen not found");

  const seats = db
    .prepare(
      "SELECT * FROM seats WHERE screen_id = ? ORDER BY row_label ASC, seat_number ASC",
    )
    .all(id);
  return { ...screen, seats };
}

/**
 * Creates a screen and auto-generates its seat grid (rows x columns).
 * The last two rows are marked VIP by default - a simple, sensible convention
 * that keeps seat creation fully automatic instead of requiring manual seat entry.
 */

export function createScreen(name: string, rows: number, columns: number) {
  const existing = db
    .prepare("SELECT id FROM screens WHERE name = ?")
    .get(name);
  if (existing)
    throw new AppError(409, "A screen with this name already exists");

  const createTx = transaction(() => {
    const info = db
      .prepare("INSERT INTO screens (name, rows, columns) VALUES (?, ?, ?)")
      .run(name, rows, columns);
    const screenId = info.lastInsertRowid as number;

    const insertSeat = db.prepare(
      "INSERT INTO seats (screen_id, row_label, seat_number, seat_type) VALUES (?, ?, ?, ?)",
    );
    for (let r = 0; r < rows; r++) {
      const rowLabel = String.fromCharCode(65 + r);
      const seatType = r >= rows - 2 ? "vip" : "standard";
      for (let c = 1; c <= columns; c++) {
        insertSeat.run(screenId, rowLabel, c, seatType);
      }
    }
    return screenId;
  });

  const screenId = createTx();
  return getScreenWithSeats(screenId);
}

export function deleteScreen(id: number) {
  const existing = db.prepare("SELECT id FROM screens WHERE id = ?").get(id);
  if (!existing) throw new AppError(404, "Screen not found");
  db.prepare("DELETE FROM screens WHERE id = ?").run(id);
}
