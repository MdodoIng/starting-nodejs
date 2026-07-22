import { Router } from "express";
import { register, login, getUser } from "../controllers/auth.controller";
import { requireAuth, AuthedRequest } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users/:id", getUser);
router.get("/me", requireAuth, (req: AuthedRequest, res) => res.json(req.user));

export default router;
