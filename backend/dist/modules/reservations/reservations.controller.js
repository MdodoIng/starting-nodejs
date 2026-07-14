"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.listMine = listMine;
exports.cancel = cancel;
exports.listAll = listAll;
const reservationsService = __importStar(require("./reservations.service"));
const AppError_1 = require("../../utils/AppError");
function create(req, res) {
    if (!req.user)
        throw new AppError_1.AppError(401, "Authentication required");
    const { showtime_id, seat_ids, payment_method } = req.body;
    const reservation = reservationsService.createReservation({
        userId: req.user.id,
        showtimeId: showtime_id,
        seatIds: seat_ids,
        paymentMethod: payment_method,
    });
    res.status(201).json({ reservation });
}
function listMine(req, res) {
    if (!req.user)
        throw new AppError_1.AppError(401, "Authentication required");
    res.json({
        reservations: reservationsService.listReservationsForUser(req.user.id),
    });
}
function cancel(req, res) {
    if (!req.user)
        throw new AppError_1.AppError(401, "Authentication required");
    const id = Number(req.params.id);
    if (Number.isNaN(id))
        throw new AppError_1.AppError(400, "Invalid reservation id");
    const reservation = reservationsService.cancelReservation(id, req.user);
    res.json({ reservation });
}
function listAll(req, res) {
    const { showtime_id, status } = req.query;
    res.json({
        reservations: reservationsService.listAllReservations({
            showtime_id,
            status,
        }),
    });
}
