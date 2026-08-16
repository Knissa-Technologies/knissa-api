import { Router } from "express";

import { UserRole } from "@prisma/client";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";
import { requireRole } from "../../../shared/middlewares/requireRole.js";

import type { IdParams } from "../../../shared/http/RouteParams.js";

import { TransactionsController } from "../controllers/TransactionsController.js";

const router = Router();

const transactionsController =
  new TransactionsController();

router.use(authMiddleware);

// ======================================================
// CURRENT USER TRANSACTIONS
// ======================================================

router.get(
  "/",
  (req, res) =>
    transactionsController.findAll(
      req,
      res,
    ),
);

router.get<IdParams>(
  "/:id",
  (req, res) =>
    transactionsController.findById(
      req,
      res,
    ),
);

// ======================================================
// TRANSFER
// ======================================================

router.post(
  "/transfer",
  (req, res) =>
    transactionsController.transfer(
      req,
      res,
    ),
);

// ======================================================
// TEST DEPOSIT — ADMIN ONLY
// Disabled automatically in production.
// ======================================================

router.post(
  "/deposit",
  requireRole(UserRole.ADMIN),
  (req, res) =>
    transactionsController.deposit(
      req,
      res,
    ),
);

export default router;