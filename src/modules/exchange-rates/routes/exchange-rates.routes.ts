import { Router } from "express";

import { ExchangeRatesController } from "../controllers/ExchangeRatesController.js";

const exchangeRatesRoutes = Router();

const exchangeRatesController =
  new ExchangeRatesController();

// ======================================================
// FIND ALL EXCHANGE RATES
// GET /exchange-rates
// ======================================================

exchangeRatesRoutes.get(
  "/",
  (req, res) =>
    exchangeRatesController.findAll(req, res),
);

// ======================================================
// FIND EXCHANGE RATE BY ID
// GET /exchange-rates/:id
// ======================================================

exchangeRatesRoutes.get(
  "/:id",
  (req, res) =>
    exchangeRatesController.findById(req, res),
);

// ======================================================
// CREATE EXCHANGE RATE
// POST /exchange-rates
// ======================================================

exchangeRatesRoutes.post(
  "/",
  (req, res) =>
    exchangeRatesController.create(req, res),
);

// ======================================================
// UPDATE EXCHANGE RATE
// PATCH /exchange-rates/:id
// ======================================================

exchangeRatesRoutes.patch(
  "/:id",
  (req, res) =>
    exchangeRatesController.update(req, res),
);

// ======================================================
// EXPIRE EXCHANGE RATE
// PATCH /exchange-rates/:id/expire
// ======================================================

exchangeRatesRoutes.patch(
  "/:id/expire",
  (req, res) =>
    exchangeRatesController.expire(req, res),
);

export { exchangeRatesRoutes };