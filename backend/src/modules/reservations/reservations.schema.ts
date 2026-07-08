import { z } from "zod";

export const createReservationSchema = z.object({
  showtime_id: z.number().int().positive(),
  seat_ids: z
    .array(z.number().int().positive())
    .min(1, "Select at least one seat"),
});

export const listReservationsQuerySchema = z.object({
  showtime_id: z.coerce.number().int().positive().optional(),
  status: z.enum(["confirmed", "cancelled"]).optional(),
});
