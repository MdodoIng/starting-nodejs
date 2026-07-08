"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listShowtimesQuerySchema = exports.updateShowtimeSchema = exports.createShowtimeSchema = void 0;
const zod_1 = require("zod");
exports.createShowtimeSchema = zod_1.z.object({
    movie_id: zod_1.z.number().int().positive(),
    screen_id: zod_1.z.number().int().positive(),
    start_time: zod_1.z.string().min(1, "start_time (ISO string) is required"),
    price: zod_1.z.number().nonnegative(),
});
exports.updateShowtimeSchema = exports.createShowtimeSchema.partial();
exports.listShowtimesQuerySchema = zod_1.z.object({
    date: zod_1.z.string().optional(), // YYYY-MM-DD
    movie_id: zod_1.z.coerce.number().int().positive().optional(),
});
