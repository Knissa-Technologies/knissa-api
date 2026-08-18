import { Router } from "express";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";

import { PaymentsController } from "../controllers/PaymentsController.js";

const router = Router();

const paymentsController = new PaymentsController();

router.use(authMiddleware);

// ======================================================
// CREATE PAYMENT
// ======================================================

router.post(
  "/",
  (req, res) =>
    paymentsController.create(req, res),
);

// ======================================================
// LIST PAYMENTS
// ======================================================

router.get(
  "/",
  (req, res) =>
    paymentsController.findAll(req, res),
);

// ======================================================
// FIND PAYMENT BY ID
// ======================================================

router.get(
  "/:paymentId",
  (req, res) =>
    paymentsController.findById(req, res),
);

// ======================================================
// REFUND PAYMENT
// ======================================================

router.post(
  "/:paymentId/refund",
  (req, res) =>
    paymentsController.refund(req, res),
);

export default router;