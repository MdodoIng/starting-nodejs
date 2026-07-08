"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReservationsQuerySchema = exports.createReservationSchema = void 0;
const zod_1 = require("zod");
exports.createReservationSchema = zod_1.z.object({
    showtime_id: zod_1.z.number().int().positive(),
    seat_ids: zod_1.z
        .array(zod_1.z.number().int().positive())
        .min(1, "Select at least one seat"),
});
exports.listReservationsQuerySchema = zod_1.z.object({
    showtime_id: zod_1.z.coerce.number().int().positive().optional(),
    status: zod_1.z.enum(["confirmed", "cancelled"]).optional(),
});
