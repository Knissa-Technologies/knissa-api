import type { Request, Response } from "express";

import { ComplianceService } from "../services/ComplianceService.js";

export class ComplianceController {
  private readonly complianceService = new ComplianceService();

  async getMyComplianceProfile(req: Request, res: Response) {
    try {
      const profile = await this.complianceService.getMyComplianceProfile(
        req.user!.id,
      );

      return res.status(200).json({
        success: true,
        message: "Compliance profile retrieved successfully.",
        data: profile,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve compliance profile.",
      });
    }
  }

  async createDocument(req: Request, res: Response) {
    try {
      const document = await this.complianceService.createDocument(
        req.user!.id,
        req.body,
      );

      return res.status(201).json({
        success: true,
        message: "Compliance document submitted successfully.",
        data: document,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit compliance document.",
      });
    }
  }

  async getMyDocuments(req: Request, res: Response) {
    try {
      const documents = await this.complianceService.getMyDocuments(
        req.user!.id,
      );

      return res.status(200).json({
        success: true,
        message: "Compliance documents retrieved successfully.",
        data: documents,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve compliance documents.",
      });
    }
  }

  async getDocumentById(req: Request, res: Response) {
    try {
      const documentId = String(req.params.id);

      const document = await this.complianceService.getDocumentById(
        req.user!.id,
        documentId,
      );

      return res.status(200).json({
        success: true,
        message: "Compliance document retrieved successfully.",
        data: document,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Compliance document not found.",
      });
    }
  }

  async getPendingProfiles(_req: Request, res: Response) {
    try {
      const profiles = await this.complianceService.getPendingProfiles();

      return res.status(200).json({
        success: true,
        message: "Pending compliance profiles retrieved successfully.",
        data: profiles,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve pending compliance profiles.",
      });
    }
  }

  async createReview(req: Request, res: Response) {
    try {
      const review = await this.complianceService.createReview(
        req.user!.id,
        req.body,
      );

      return res.status(201).json({
        success: true,
        message: "Compliance review completed successfully.",
        data: review,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to complete compliance review.",
      });
    }
  }
}
