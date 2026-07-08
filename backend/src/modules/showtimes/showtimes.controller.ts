import { Request, Response } from "express";
import * as showtimesService from "./showtimes.service";
import { AppError } from "../../utils/AppError";

export function list(req: Request, res: Response) {
  const { date, movie_id } = req.query as { date?: string; movie_id?: number };
  res.json({ showtimes: showtimesService.listShowtimes({ date, movie_id }) });
}

export function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError(400, "Invalid showtime id");
  res.json({ showtime: showtimesService.getShowtimeById(id) });
}

export function getSeatMap(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError(400, "Invalid showtime id");
  res.json(showtimesService.getShowtimeSeatMap(id));
}

export function create(req: Request, res: Response) {
  const showtime = showtimesService.createShowtime(req.body);
  res.status(201).json({ showtime });
}

export function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError(400, "Invalid showtime id");
  const showtime = showtimesService.updateShowtime(id, req.body);
  res.json({ showtime });
}

export function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError(400, "Invalid showtime id");
  showtimesService.deleteShowtime(id);
  res.status(204).send();
}
