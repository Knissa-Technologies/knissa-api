import { Router } from "express";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";

import type { IdParams } from "../../../shared/http/RouteParams.js";

import { RecipientsController } from "../controllers/RecipientsController.js";

const router = Router();

const recipientsController = new RecipientsController();

router.use(authMiddleware);

// ======================================================
// CURRENT USER RECIPIENTS
// ======================================================

router.get(
  "/",
  (req, res) =>
    recipientsController.findAll(req, res),
);

router.get<IdParams>(
  "/:id",
  (req, res) =>
    recipientsController.findById(req, res),
);

router.post(
  "/",
  (req, res) =>
    recipientsController.create(req, res),
);

router.patch<IdParams>(
  "/:id",
  (req, res) =>
    recipientsController.update(req, res),
);

export default router;
