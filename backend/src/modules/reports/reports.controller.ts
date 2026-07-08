import { Request, Response } from "express";
import * as reportsService from "./reports.service";

export function summary(_req: Request, res: Response) {
  res.json(reportsService.getSummary());
}

export function revenueByMovie(req: Request, res: Response) {
  const { from, to } = req.query as { from?: string; to?: string };
  res.json({
    revenue_by_movie: reportsService.getRevenueByMovie({ from, to }),
  });
}

export function capacity(req: Request, res: Response) {
  const showtimeId = req.query.showtime_id
    ? Number(req.query.showtime_id)
    : undefined;
  res.json({
    capacity: reportsService.getCapacityReport({ showtime_id: showtimeId }),
  });
}
