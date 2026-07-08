import { Router } from "express";
import * as reservationsController from "./reservations.controller";
import {
  createReservationSchema,
  listReservationsQuerySchema,
} from "./reservations.schema";
import { validateBody, validateQuery } from "../../middleware/validate";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validateBody(createReservationSchema),
  asyncHandler(async (req, res) => reservationsController.create(req, res)),
);
router.get(
  "/me",
  asyncHandler(async (req, res) => reservationsController.listMine(req, res)),
);
router.patch(
  "/:id/cancel",
  asyncHandler(async (req, res) => reservationsController.cancel(req, res)),
);

router.get(
  "/",
  requireRole("admin"),
  validateQuery(listReservationsQuerySchema),
  asyncHandler(async (req, res) => reservationsController.listAll(req, res)),
);

export default router;
