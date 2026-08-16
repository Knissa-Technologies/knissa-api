import { Router } from "express";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";

import type { IdParams } from "../../../shared/http/RouteParams.js";

import { WalletsController } from "../controllers/WalletsController.js";

const router = Router();

const walletsController = new WalletsController();

router.use(authMiddleware);

// ======================================================
// CURRENT USER WALLETS
// ======================================================

router.get(
  "/",
  (req, res) =>
    walletsController.findAll(req, res),
);

router.get<IdParams>(
  "/:id",
  (req, res) =>
    walletsController.findById(req, res),
);

export default router;
