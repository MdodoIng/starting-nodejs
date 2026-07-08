import { Request, Response } from "express";
import * as moviesService from "./movies.service";
import { AppError } from "../../utils/AppError";

export function list(req: Request, res: Response) {
  const { genre, search } = req.query as { genre?: string; search?: string };
  res.json({ movies: moviesService.listMovies({ genre, search }) });
}

export function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError(400, "Invalid movie id");
  res.json({ movie: moviesService.getMovieById(id) });
}

export function create(req: Request, res: Response) {
  const movie = moviesService.createMovie(req.body);
  res.status(201).json({ movie });
}

export function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError(400, "Invalid movie id");
  const movie = moviesService.updateMovie(id, req.body);
  res.json({ movie });
}

export function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError(400, "Invalid movie id");
  moviesService.deleteMovie(id);
  res.status(204).send();
}
