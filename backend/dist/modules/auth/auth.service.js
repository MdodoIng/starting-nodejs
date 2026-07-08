"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.getUserById = getUserById;
const database_1 = __importDefault(require("../../db/database"));
const AppError_1 = require("../../utils/AppError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../../utils/jwt");
function signup(name, email, password) {
    const existing = database_1.default
        .prepare("SELECT id FROM users WHERE email = ?")
        .get(email);
    if (existing) {
        throw new AppError_1.AppError(409, "An account with this email already exists");
    }
    const passwordHash = bcryptjs_1.default.hashSync(password, 10);
    const info = database_1.default
        .prepare(`
    INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')
    `)
        .run(name, email, passwordHash);
    const user = database_1.default
        .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
        .get(info.lastInsertRowid);
    const token = (0, jwt_1.signToken)({ id: user.id, email: user.email, role: user.role });
    return { user, token };
}
function login(email, password) {
    const user = database_1.default.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
        throw new AppError_1.AppError(401, "Invalid email or password");
    }
    const matches = bcryptjs_1.default.compareSync(password, user.password_hash);
    if (!matches) {
        throw new AppError_1.AppError(401, "Invalid email or password");
    }
    const token = (0, jwt_1.signToken)({ id: user.id, email: user.email, role: user.role });
    const { password_hash, ...safeUser } = user;
    return { user: safeUser, token };
}
function getUserById(id) {
    const user = database_1.default
        .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
        .get(id);
    if (!user) {
        throw new AppError_1.AppError(404, "User not found");
    }
    return user;
}
