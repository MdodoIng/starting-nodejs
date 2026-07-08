"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGenres = listGenres;
exports.createGenre = createGenre;
const database_1 = require("../../db/database");
const AppError_1 = require("../../utils/AppError");
function listGenres() {
    return database_1.db.prepare("SELECT * FROM genres ORDER BY name ASC").all();
}
function createGenre(name) {
    const existing = database_1.db.prepare("SELECT id FROM genres WHERE name = ?").get(name);
    if (existing)
        throw new AppError_1.AppError(409, "Genre already exists");
    const info = database_1.db.prepare("INSERT INTO genres (name) VALUES (?)").run(name);
    return database_1.db
        .prepare("SELECT * FROM genres WHERE id = ?")
        .get(info.lastInsertRowid);
}
