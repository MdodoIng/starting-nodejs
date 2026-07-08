"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.transaction = transaction;
const node_sqlite_1 = require("node:sqlite");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbPath = process.env.DATABASE_PATH || "./data/movie_reservations.db";
const dbDir = path_1.default.dirname(dbPath);
if (!fs_1.default.existsSync(dbDir)) {
    fs_1.default.mkdirSync(dbDir, { recursive: true });
}
exports.db = new node_sqlite_1.DatabaseSync(dbPath);
exports.db.exec("PRAGMA journal_mode = WAL");
exports.db.exec("PRAGMA foreign_keys = ON");
/**
 * Mimics better-sqlite3's db.transaction(fn) API on top of node:sqlite,
 * which has no built-in transaction helper. Since node:sqlite is
 * synchronous and Node is single-threaded, wrapping BEGIN/COMMIT/ROLLBACK
 * around a synchronous function body is enough to make the whole
 * operation atomic from the app's point of view - no other request can
 * interleave statements in between.
 */
function transaction(fn) {
    return (...args) => {
        exports.db.exec("BEGIN IMMEDIATE");
        try {
            const result = fn(...args);
            exports.db.exec("COMMIT");
            return result;
        }
        catch (err) {
            try {
                exports.db.exec("ROLLBACK");
            }
            catch {
                /* ignore rollback failure if transaction was never fully started */
            }
            throw err;
        }
    };
}
exports.default = exports.db;
