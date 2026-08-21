import { Router } from "express";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";

import { PaymentLinksController } from "../controllers/PaymentLinksController.js";

const router = Router();

const paymentLinksController =
  new PaymentLinksController();

router.use(authMiddleware);

// ======================================================
// CREATE PAYMENT LINK
// ======================================================

router.post(
  "/",
  (req, res) =>
    paymentLinksController.create(req, res),
);

// ======================================================
// LIST PAYMENT LINKS
// ======================================================

router.get(
  "/",
  (req, res) =>
    paymentLinksController.findAll(req, res),
);

// ======================================================
// FIND PAYMENT LINK BY ID
// ======================================================

router.get(
  "/:id",
  (req, res) =>
    paymentLinksController.findById(req, res),
);

// ======================================================
// CANCEL PAYMENT LINK
// ======================================================

router.patch(
  "/:id/cancel",
  (req, res) =>
    paymentLinksController.cancel(req, res),
);

// ======================================================
// PAY PAYMENT LINK
// ======================================================

router.post(
  "/:id/pay",
  (req, res) =>
    paymentLinksController.pay(req, res),
);

export default router;