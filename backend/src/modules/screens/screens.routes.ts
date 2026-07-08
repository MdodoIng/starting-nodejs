import { Router } from "express";
import * as screensController from "./screens.controller";
import { createScreenSchema } from "./screens.schema";
import { validateBody } from "../../middleware/validate";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => screensController.list(req, res)),
);
router.get(
  "/:id",
  asyncHandler(async (req, res) => screensController.getById(req, res)),
);

router.post(
  "/",
  authenticate,
  requireRole("admin"),
  validateBody(createScreenSchema),
  asyncHandler(async (req, res) => screensController.create(req, res)),
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => screensController.remove(req, res)),
);

export default router;
