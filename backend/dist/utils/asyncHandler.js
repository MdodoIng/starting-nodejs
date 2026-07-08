"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
/**
 * Wraps an async route handler so thrown errors / rejected promises
 * are forwarded to Express's error-handling middleware instead of
 * crashing the process or hanging the request.
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next);
    };
}
