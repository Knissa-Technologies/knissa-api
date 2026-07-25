import { Router } from "express";

import { AuthController } from "./controllers/AuthController.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";

import { registerSchema } from "./schemas/register.schema.js";
import { loginSchema } from "./schemas/login.schema.js";
import { refreshSchema } from "./schemas/refresh.schema.js";

const router = Router();

const authController = new AuthController();

router.post(
  "/register",
  validate(registerSchema),
  authController.register.bind(authController),
);

router.post(
  "/login",
  validate(loginSchema),
  authController.login.bind(authController),
);

router.post(
  "/refresh",
  validate(refreshSchema),
  authController.refresh.bind(authController),
);

router.post(
  "/logout",
  validate(refreshSchema),
  authController.logout.bind(authController),
);

router.post(
  "/logout-all",
  authMiddleware,
  authController.logoutAll.bind(authController),
);

export default router;