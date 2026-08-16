import type { Request, Response } from "express";

import type { IdParams } from "../../../shared/http/RouteParams.js";

import type { CreateRecipientDTO } from "../dtos/CreateRecipientDTO.js";
import type { UpdateRecipientDTO } from "../dtos/UpdateRecipientDTO.js";

import { RecipientsService } from "../services/RecipientsService.js";

export class RecipientsController {
  private recipientsService = new RecipientsService();

  async findAll(req: Request, res: Response) {
    const userId = req.user!.id;

    const recipients = await this.recipientsService.findAll(userId);

    return res.status(200).json({
      success: true,
      message: "Recipients retrieved successfully.",
      data: recipients,
    });
  }

  async findById(
    req: Request<IdParams>,
    res: Response,
  ) {
    const userId = req.user!.id;

    const recipient = await this.recipientsService.findById(
      userId,
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      message: "Recipient retrieved successfully.",
      data: recipient,
    });
  }

  async create(
    req: Request<{}, {}, CreateRecipientDTO>,
    res: Response,
  ) {
    const userId = req.user!.id;

    const recipient = await this.recipientsService.create(
      userId,
      req.body,
    );

    return res.status(201).json({
      success: true,
      message: "Recipient created successfully.",
      data: recipient,
    });
  }

  async update(
    req: Request<IdParams, {}, UpdateRecipientDTO>,
    res: Response,
  ) {
    const userId = req.user!.id;

    const recipient = await this.recipientsService.update(
      userId,
      req.params.id,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Recipient updated successfully.",
      data: recipient,
    });
  }
}
