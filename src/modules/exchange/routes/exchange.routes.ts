import { Router } from "express";

import { ExchangeController } from "../controllers/ExchangeController.js";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";

const router = Router();

const exchangeController =
  new ExchangeController();

router.use(authMiddleware);

// ======================================================
// CREATE EXCHANGE QUOTE
// ======================================================

router.post(
  "/quotes",
  (req, res) =>
    exchangeController.createQuote(req, res),
);

// ======================================================
// ACCEPT EXCHANGE QUOTE
// ======================================================

router.post(
  "/quotes/:id/accept",
  (req, res) =>
    exchangeController.acceptQuote(req, res),
);

// ======================================================
// FIND ALL EXCHANGES
// ======================================================

router.get(
  "/",
  (req, res) =>
    exchangeController.findAll(req, res),
);

// ======================================================
// FIND EXCHANGE BY ID
// ======================================================

router.get(
  "/:id",
  (req, res) =>
    exchangeController.findById(req, res),
);

export default router;