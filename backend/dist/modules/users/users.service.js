"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.promoteToAdmin = promoteToAdmin;
const database_1 = require("../../db/database");
const AppError_1 = require("../../utils/AppError");
function listUsers() {
    return database_1.db
        .prepare("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC")
        .all();
}
function promoteToAdmin(userId) {
    const user = database_1.db
        .prepare("SELECT id, role FROM users WHERE id = ?")
        .get(userId);
    if (!user) {
        throw new AppError_1.AppError(404, "User not found");
    }
    database_1.db.prepare(`UPDATE users SET role = 'admin' WHERE id = ?`).run(userId);
    return database_1.db
        .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
        .get(userId);
}
