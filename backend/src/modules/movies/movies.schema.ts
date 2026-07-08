import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  poster_url: z.string().url().optional().or(z.literal("")),
  duration_minutes: z.number().int().positive(),
  genre_ids: z.array(z.number().int().positive()).optional(),
});

export const updateMovieSchema = createMovieSchema.partial();

export const listMoviesQuerySchema = z.object({
  genre: z.string().optional(),
  search: z.string().optional(),
});
