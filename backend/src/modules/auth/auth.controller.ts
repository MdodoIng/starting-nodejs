import { Request, Response } from "express";
import * as authService from "./auth.service";
import { AppError } from "../../utils/AppError";

export function signup(req: Request, res: Response) {
  const { name, email, password } = req.body;
  const result = authService.signup(name, email, password);
  res.status(201).json(result);
}

export function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = authService.login(email, password);
  res.status(200).json(result);
}

export function me(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, "Authentication required");
  const user = authService.getUserById(req.user.id);
  res.status(200).json({ user });
}
