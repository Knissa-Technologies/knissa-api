import { Router } from "express";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";

import type { IdParams } from "../../../shared/http/RouteParams.js";

import { AccountsController } from "../controllers/AccountsController.js";

const router = Router();

const accountsController = new AccountsController();

router.use(authMiddleware);

// ======================================================
// CURRENT USER ACCOUNTS
// ======================================================

router.get(
  "/",
  (req, res) =>
    accountsController.findAll(req, res),
);

router.get<IdParams>(
  "/:id",
  (req, res) =>
    accountsController.findById(req, res),
);

router.patch<IdParams>(
  "/:id",
  (req, res) =>
    accountsController.update(req, res),
);

export default router;
