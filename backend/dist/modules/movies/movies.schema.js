"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMoviesQuerySchema = exports.updateMovieSchema = exports.createMovieSchema = void 0;
const zod_1 = require("zod");
exports.createMovieSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(2000).optional(),
    poster_url: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
    duration_minutes: zod_1.z.number().int().positive(),
    genre_ids: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
});
exports.updateMovieSchema = exports.createMovieSchema.partial();
exports.listMoviesQuerySchema = zod_1.z.object({
    genre: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
});
