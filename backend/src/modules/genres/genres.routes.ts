import { Router } from "express";
import * as genresController from "./genres.controller";
import { createGenreSchema } from "./genres.schema";
import { validateBody } from "../../middleware/validate";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => genresController.list(req, res)),
);
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  validateBody(createGenreSchema),
  asyncHandler(async (req, res) => genresController.create(req, res)),
);

export default router;
