import { Request, Response } from "express";
import * as genresService from "./genres.service";

export function list(_req: Request, res: Response) {
  res.json({ genres: genresService.listGenres() });
}

export function create(req: Request, res: Response) {
  const genre = genresService.createGenre(req.body.name);
  res.status(201).json({ genre });
}
