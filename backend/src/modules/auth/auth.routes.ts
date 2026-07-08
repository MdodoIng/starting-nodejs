import { Router } from "express";
import * as authController from "./auth.controller";
import { signupSchema, loginSchema } from "./auth.schema";
import { validateBody } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post(
  "/signup",
  validateBody(signupSchema),
  asyncHandler(async (req, res) => authController.signup(req, res)),
);
router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => authController.login(req, res)),
);
router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => authController.me(req, res)),
);

export default router;
