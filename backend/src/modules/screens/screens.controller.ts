import { Request, Response } from "express";
import * as screensService from "./screens.service";
import { AppError } from "../../utils/AppError";

export function list(_req: Request, res: Response) {
  res.json({ screens: screensService.listScreens() });
}

export function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError(400, "Invalid screen id");
  res.json({ screen: screensService.getScreenWithSeats(id) });
}

export function create(req: Request, res: Response) {
  const { name, rows, columns } = req.body;
  const screen = screensService.createScreen(name, rows, columns);
  res.status(201).json({ screen });
}

export function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new AppError(400, "Invalid screen id");
  screensService.deleteScreen(id);
  res.status(204).send();
}
