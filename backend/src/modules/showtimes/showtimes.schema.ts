import { z } from "zod";

export const createShowtimeSchema = z.object({
  movie_id: z.number().int().positive(),
  screen_id: z.number().int().positive(),
  start_time: z.string().min(1, "start_time (ISO string) is required"),
  price: z.number().nonnegative(),
});

export const updateShowtimeSchema = createShowtimeSchema.partial();

export const listShowtimesQuerySchema = z.object({
  date: z.string().optional(), // YYYY-MM-DD
  movie_id: z.coerce.number().int().positive().optional(),
});
