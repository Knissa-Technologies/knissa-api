import { Router } from "express";

import { AuthController } from "../controllers/AuthController.js";

const router = Router();

const authController = new AuthController();

router.post("/register", (req, res) =>
  authController.register(req, res)
);

router.post("/verify-email", (req, res) =>
  authController.verifyEmail(req, res)
);

export default router;