"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./database");
function migrate() {
    const schemaPath = path_1.default.join(__dirname, "schema.sql");
    const schema = fs_1.default.readFileSync(schemaPath, "utf-8");
    database_1.db.exec(schema);
    const reservationColumns = database_1.db
        .prepare("PRAGMA table_info(reservations)")
        .all();
    const hasPaymentMethod = reservationColumns.some((column) => column.name === "payment_method");
    if (!hasPaymentMethod) {
        database_1.db.exec("ALTER TABLE reservations ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'card';");
        database_1.db.exec("UPDATE reservations SET payment_method = 'card' WHERE payment_method IS NULL;");
    }
    console.log("Migration complete: schema applied.");
}
migrate();
