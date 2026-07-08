import { Router } from "express";
import * as reportsController from "./reports.controller";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get(
  "/summary",
  asyncHandler(async (req, res) => reportsController.summary(req, res)),
);
router.get(
  "/revenue",
  asyncHandler(async (req, res) => reportsController.revenueByMovie(req, res)),
);
router.get(
  "/capacity",
  asyncHandler(async (req, res) => reportsController.capacity(req, res)),
);

export default router;
