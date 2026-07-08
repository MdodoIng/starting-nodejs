"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listScreens = listScreens;
exports.getScreenWithSeats = getScreenWithSeats;
exports.createScreen = createScreen;
exports.deleteScreen = deleteScreen;
const database_1 = require("../../db/database");
const AppError_1 = require("../../utils/AppError");
function listScreens() {
    return database_1.db.prepare("SELECT * FROM screens ORDER BY name ASC").all();
}
function getScreenWithSeats(id) {
    const screen = database_1.db.prepare("SELECT * FROM screens WHERE id = ?").get(id);
    if (!screen)
        throw new AppError_1.AppError(404, "Screen not found");
    const seats = database_1.db
        .prepare("SELECT * FROM seats WHERE screen_id = ? ORDER BY row_label ASC, seat_number ASC")
        .all(id);
    return { ...screen, seats };
}
/**
 * Creates a screen and auto-generates its seat grid (rows x columns).
 * The last two rows are marked VIP by default - a simple, sensible convention
 * that keeps seat creation fully automatic instead of requiring manual seat entry.
 */
function createScreen(name, rows, columns) {
    const existing = database_1.db
        .prepare("SELECT id FROM screens WHERE name = ?")
        .get(name);
    if (existing)
        throw new AppError_1.AppError(409, "A screen with this name already exists");
    const createTx = (0, database_1.transaction)(() => {
        const info = database_1.db
            .prepare("INSERT INTO screens (name, rows, columns) VALUES (?, ?, ?)")
            .run(name, rows, columns);
        const screenId = info.lastInsertRowid;
        const insertSeat = database_1.db.prepare("INSERT INTO seats (screen_id, row_label, seat_number, seat_type) VALUES (?, ?, ?, ?)");
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
function deleteScreen(id) {
    const existing = database_1.db.prepare("SELECT id FROM screens WHERE id = ?").get(id);
    if (!existing)
        throw new AppError_1.AppError(404, "Screen not found");
    database_1.db.prepare("DELETE FROM screens WHERE id = ?").run(id);
}
