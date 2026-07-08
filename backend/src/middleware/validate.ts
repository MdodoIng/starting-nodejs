import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/** Validates req.body against a zod schema and replaces req.body with the parsed (typed) result. */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
}

/** Validates req.query against a zod schema and replaces req.query with the parsed result. */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.query = schema.parse(req.query) as any;
    next();
  };
}
