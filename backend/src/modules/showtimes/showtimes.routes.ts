import { Router } from "express";
import * as showtimesController from "./showtimes.controller";
import {
  createShowtimeSchema,
  updateShowtimeSchema,
  listShowtimesQuerySchema,
} from "./showtimes.schema";
import { validateBody, validateQuery } from "../../middleware/validate";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get(
  "/",
  validateQuery(listShowtimesQuerySchema),
  asyncHandler(async (req, res) => showtimesController.list(req, res)),
);
router.get(
  "/:id",
  asyncHandler(async (req, res) => showtimesController.getById(req, res)),
);
router.get(
  "/:id/seats",
  asyncHandler(async (req, res) => showtimesController.getSeatMap(req, res)),
);

router.post(
  "/",
  authenticate,
  requireRole("admin"),
  validateBody(createShowtimeSchema),
  asyncHandler(async (req, res) => showtimesController.create(req, res)),
);
router.patch(
  "/:id",
  authenticate,
  requireRole("admin"),
  validateBody(updateShowtimeSchema),
  asyncHandler(async (req, res) => showtimesController.update(req, res)),
);
router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => showtimesController.remove(req, res)),
);

export default router;
