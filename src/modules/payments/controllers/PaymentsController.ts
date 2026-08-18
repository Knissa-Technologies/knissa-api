import type { Request, Response } from "express";

import { PaymentsService } from "../services/PaymentsService.js";

export class PaymentsController {
  private paymentsService = new PaymentsService();

  // ======================================================
  // CREATE PAYMENT
  // ======================================================

  async create(req: Request, res: Response) {
    const userId = req.user!.id;

    const payment = await this.paymentsService.create(
      userId,
      req.body,
    );

    return res.status(201).json({
      success: true,
      message: "Payment completed successfully.",
      data: payment,
    });
  }

  // ======================================================
  // LIST PAYMENTS
  // ======================================================

  async findAll(req: Request, res: Response) {
    const userId = req.user!.id;

    const payments =
      await this.paymentsService.findAll(userId);

    return res.status(200).json({
      success: true,
      message: "Payments retrieved successfully.",
      data: payments,
    });
  }

  // ======================================================
  // FIND PAYMENT BY ID
  // ======================================================

  async findById(req: Request, res: Response) {
    const userId = req.user!.id;

    const paymentId = String(req.params.paymentId);

    const payment =
      await this.paymentsService.findById(
        userId,
        paymentId,
      );

    return res.status(200).json({
      success: true,
      message: "Payment retrieved successfully.",
      data: payment,
    });
  }

  // ======================================================
  // REFUND PAYMENT
  // ======================================================

  async refund(req: Request, res: Response) {
    const userId = req.user!.id;

    const paymentId = String(req.params.paymentId);

    const payment =
      await this.paymentsService.refund(
        userId,
        paymentId,
        req.body,
      );

    return res.status(200).json({
      success: true,
      message: "Payment refunded successfully.",
      data: payment,
    });
  }
}