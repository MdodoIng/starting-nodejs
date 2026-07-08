"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../utils/AppError");
function authenticate(req, _res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return next(new AppError_1.AppError(401, "Missing or invalid Authorization header"));
    }
    const token = header.slice("Bearer ".length);
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch {
        next(new AppError_1.AppError(401, "Invalid or expired token"));
    }
}
/** Allows the request through only if the authenticated user has one of the given roles. */
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new AppError_1.AppError(401, "Authentication required"));
        }
        if (!roles.includes(req.user.role)) {
            return next(new AppError_1.AppError(403, "You do not have permission to perform this action"));
        }
        next();
    };
}
