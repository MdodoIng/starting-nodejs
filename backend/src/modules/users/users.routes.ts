import { Router } from "express";
import * as usersController from "./users.controller";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get(
  "/",
  asyncHandler(async (req, res) => usersController.listUsers(req, res)),
);

router.patch(
  "/:id/promote",
  asyncHandler(async (req, res) => usersController.promote(req, res)),
);

export default router;
