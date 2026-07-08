import { Router } from "express";
import * as moviesController from "./movies.controller";
import {
  createMovieSchema,
  updateMovieSchema,
  listMoviesQuerySchema,
} from "./movies.schema";
import { validateBody, validateQuery } from "../../middleware/validate";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get(
  "/",
  validateQuery(listMoviesQuerySchema),
  asyncHandler(async (req, res) => moviesController.list(req, res)),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => moviesController.getById(req, res)),
);

router.post(
  "/",
  authenticate,
  requireRole("admin"),
  validateBody(createMovieSchema),
  asyncHandler(async (req, res) => moviesController.create(req, res)),
);

router.patch(
  "/:id",
  authenticate,
  requireRole("admin"),
  validateBody(updateMovieSchema),
  asyncHandler(async (req, res) => moviesController.update(req, res)),
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => moviesController.remove(req, res)),
);

export default router;
