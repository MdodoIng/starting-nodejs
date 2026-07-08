import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({ error: err.message, details: err.details });
  }

  // Unique constraint violations from better-sqlite3 (e.g. seat already booked, duplicate email)
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    (err as any).code === "SQLITE_CONSTRAINT_UNIQUE"
  ) {
    return res.status(409).json({
      error: "Conflict: resource already exists or seat already booked",
    });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Route not found" });
}
