import { Router } from "express";

import { AuthController } from "../controllers/AuthController.js";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";

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

// ======================================================
// LOGOUT
// ======================================================

router.post("/logout", authMiddleware, (req, res) =>
  authController.logout(req, res),
);

// ======================================================
// ACTIVE SESSIONS
// ======================================================

router.get("/sessions", authMiddleware, (req, res) =>
  authController.getSessions(req, res),
);

// ======================================================
// REVOKE SESSION
// ======================================================

router.delete("/sessions/:id", authMiddleware, (req, res) =>
  authController.revokeSession(req, res),
);

router.patch("/password", authMiddleware, (req, res) =>
  authController.changePassword(req, res),
);

router.post("/refresh", (req, res) => authController.refresh(req, res));

export default router;
