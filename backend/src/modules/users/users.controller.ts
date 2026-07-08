import { Request, Response } from "express";
import * as usersService from "./users.service";
import { AppError } from "../../utils/AppError";

export function listUsers(_req: Request, res: Response) {
  res.json({ users: usersService.listUsers() });
}

export function promote(req: Request, res: Response) {
  const userId = Number(req.params.id);
  if (Number.isNaN(userId)) throw new AppError(400, "Invalid user id");
  const user = usersService.promoteToAdmin(userId);
  res.json({ user });
}
