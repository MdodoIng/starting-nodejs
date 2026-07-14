import { Request, Response } from "express";
import * as reservationsService from "./reservations.service";
import { AppError } from "../../utils/AppError";

export function create(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, "Authentication required");
  const { showtime_id, seat_ids, payment_method } = req.body;
  const reservation = reservationsService.createReservation({
    userId: req.user.id,
    showtimeId: showtime_id,
    seatIds: seat_ids,
    paymentMethod: payment_method,
  });
  res.status(201).json({ reservation });
}

export function listMine(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, "Authentication required");
  res.json({
    reservations: reservationsService.listReservationsForUser(req.user.id),
  });
}

export function cancel(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, "Authentication required");
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError(400, "Invalid reservation id");
  const reservation = reservationsService.cancelReservation(id, req.user);
  res.json({ reservation });
}

export function listAll(req: Request, res: Response) {
  const { showtime_id, status } = req.query as {
    showtime_id?: number;
    status?: string;
  };
  res.json({
    reservations: reservationsService.listAllReservations({
      showtime_id,
      status,
    }),
  });
}
