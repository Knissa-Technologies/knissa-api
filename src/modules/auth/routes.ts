import { Router } from "express";

import { AuthController } from "./controllers/AuthController.js";

const authRoutes = Router();
const controller = new AuthController();

authRoutes.post("/register", (req, res) =>
  controller.register(req, res)
);

authRoutes.post("/login", (req, res) =>
  controller.login(req, res)
);

export { authRoutes };