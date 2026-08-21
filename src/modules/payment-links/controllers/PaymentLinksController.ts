import type { Request, Response } from "express";

import { BadRequestError } from "../../../shared/errors/BadRequestError.js";

import { PaymentLinksService } from "../services/PaymentLinksService.js";

export class PaymentLinksController {
  private paymentLinksService = new PaymentLinksService();

  // ======================================================
  // CREATE PAYMENT LINK
  // ======================================================

  async create(req: Request, res: Response) {
    const userId = req.user!.id;

    const paymentLink = await this.paymentLinksService.create(
      userId,
      req.body,
    );

    return res.status(201).json({
      success: true,
      message: "Payment link created successfully.",
      data: paymentLink,
    });
  }

  // ======================================================
  // LIST PAYMENT LINKS
  // ======================================================

  async findAll(req: Request, res: Response) {
    const userId = req.user!.id;

    const paymentLinks = await this.paymentLinksService.findAll(
      userId,
    );

    return res.status(200).json({
      success: true,
      message: "Payment links retrieved successfully.",
      data: paymentLinks,
    });
  }

  // ======================================================
  // FIND PAYMENT LINK BY ID
  // ======================================================

  async findById(req: Request, res: Response) {
    const userId = req.user!.id;

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw new BadRequestError("Invalid payment link ID.");
    }

    const paymentLink =
      await this.paymentLinksService.findById(
        userId,
        id,
      );

    return res.status(200).json({
      success: true,
      message: "Payment link retrieved successfully.",
      data: paymentLink,
    });
  }

  // ======================================================
  // CANCEL PAYMENT LINK
  // ======================================================

  async cancel(req: Request, res: Response) {
    const userId = req.user!.id;

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw new BadRequestError("Invalid payment link ID.");
    }

    const paymentLink =
      await this.paymentLinksService.cancel(
        userId,
        id,
      );

    return res.status(200).json({
      success: true,
      message: "Payment link cancelled successfully.",
      data: paymentLink,
    });
  }

  // ======================================================
  // PAY PAYMENT LINK
  // ======================================================

  async pay(req: Request, res: Response) {
    const userId = req.user!.id;

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw new BadRequestError("Invalid payment link ID.");
    }

    const payment =
      await this.paymentLinksService.pay(
        userId,
        id,
        req.body,
      );

    return res.status(201).json({
      success: true,
      message: "Payment completed successfully.",
      data: payment,
    });
  }
}