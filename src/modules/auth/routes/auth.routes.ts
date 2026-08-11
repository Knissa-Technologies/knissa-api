import { Router } from "express";

import { AuthController } from "../controllers/AuthController.js";

const router = Router();

const authController = new AuthController();

// ======================================================
// REGISTER
// ======================================================

router.post("/register", (req, res) => authController.register(req, res));

// ======================================================
// LOGIN
// ======================================================

router.post("/login", (req, res) => authController.login(req, res));

// ======================================================
// VERIFY EMAIL
// ======================================================

router.post("/verify-email", (req, res) =>
  authController.verifyEmail(req, res),
);

router.post("/refresh", (req, res) => authController.refresh(req, res));

export default router;
