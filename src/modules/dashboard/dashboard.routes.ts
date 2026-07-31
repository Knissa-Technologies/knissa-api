import { Router } from "express";

import { DashboardController } from "./controllers/DashboardController.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

const controller = new DashboardController();

router.get(
  "/",
  authMiddleware,
  controller.index.bind(controller),
);

export default router;