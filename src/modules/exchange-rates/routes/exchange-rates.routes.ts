
import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";
import { requireRole } from "../../../shared/middlewares/requireRole.js";

import { ExchangeRatesController } from "../controllers/ExchangeRatesController.js";

const exchangeRatesRoutes = Router();

const exchangeRatesController = new ExchangeRatesController();

// ======================================================
// PUBLIC — READ EXCHANGE RATES
// ======================================================

// Find all exchange rates
// GET /exchange-rates
exchangeRatesRoutes.get("/", (req, res) =>
  exchangeRatesController.findAll(req, res),
);

// Find exchange rate by ID
// GET /exchange-rates/:id
exchangeRatesRoutes.get("/:id", (req, res) =>
  exchangeRatesController.findById(req, res),
);

// ======================================================
// ADMIN — WRITE EXCHANGE RATES
// ======================================================

// Create exchange rate
// POST /exchange-rates
exchangeRatesRoutes.post(
  "/",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => exchangeRatesController.create(req, res),
);

// Update exchange rate
// PATCH /exchange-rates/:id
exchangeRatesRoutes.patch(
  "/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => exchangeRatesController.update(req, res),
);

// Expire exchange rate
// PATCH /exchange-rates/:id/expire
exchangeRatesRoutes.patch(
  "/:id/expire",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => exchangeRatesController.expire(req, res),
);

export { exchangeRatesRoutes };
