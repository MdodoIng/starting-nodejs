"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const AppError_1 = require("../utils/AppError");
const zod_1 = require("zod");
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: "Validation failed",
            details: err.issues.map((i) => ({
                path: i.path.join("."),
                message: i.message,
            })),
        });
    }
    if (err instanceof AppError_1.AppError) {
        return res
            .status(err.statusCode)
            .json({ error: err.message, details: err.details });
    }
    // Unique constraint violations from better-sqlite3 (e.g. seat already booked, duplicate email)
    if (err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return res.status(409).json({
            error: "Conflict: resource already exists or seat already booked",
        });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
}
function notFoundHandler(_req, res) {
    res.status(404).json({ error: "Route not found" });
}
