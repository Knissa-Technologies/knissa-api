import { Router } from "express";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";

import type { IdParams } from "../../../shared/http/RouteParams.js";

import { ApiKeysController } from "../controllers/ApiKeysController.js";

const router = Router();

const apiKeysController = new ApiKeysController();

// ======================================================
// AUTHENTICATION REQUIRED
// ======================================================

router.use(authMiddleware);

// ======================================================
// API KEYS
// ======================================================

// Create API key
router.post(
  "/",
  (req, res) => apiKeysController.create(req, res),
);

// Get my API keys
router.get(
  "/",
  (req, res) => apiKeysController.findAll(req, res),
);

// Get API key by ID
router.get<IdParams>(
  "/:id",
  (req, res) => apiKeysController.findById(req, res),
);

// Revoke API key
router.patch<IdParams>(
  "/:id/revoke",
  (req, res) => apiKeysController.revoke(req, res),
);

// Delete API key
router.delete<IdParams>(
  "/:id",
  (req, res) => apiKeysController.delete(req, res),
);

export default router;
