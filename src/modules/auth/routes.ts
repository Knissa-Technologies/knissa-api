import { Router } from "express";

import { AuthController } from "./controllers/AuthController.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

const authController = new AuthController();

router.post("/register", authController.register.bind(authController));

router.post("/login", authController.login.bind(authController));

router.post("/refresh", authController.refresh.bind(authController));

router.post("/logout", authController.logout.bind(authController));

router.post(
  "/logout-all",
  authMiddleware,
  authController.logoutAll.bind(authController),
);

export default router;
