import type { Request, Response } from "express";

import { MerchantsService } from "../services/MerchantsService.js";

import type { CreateMerchantDTO } from "../dtos/CreateMerchantDTO.js";
import type { UpdateMerchantDTO } from "../dtos/UpdateMerchantDTO.js";
import type { AddMerchantMemberDTO } from "../dtos/AddMerchantMemberDTO.js";
import type { UpdateMerchantSettingsDTO } from "../dtos/UpdateMerchantSettingsDTO.js";

export class MerchantsController {
  private readonly merchantsService = new MerchantsService();

  // ======================================================
  // CREATE MERCHANT
  // ======================================================

  async createMerchant(req: Request, res: Response) {
    try {
      const merchant = await this.merchantsService.createMerchant(
        req.user!.id,
        req.body as CreateMerchantDTO,
      );

      return res.status(201).json({
        success: true,
        message: "Merchant created successfully.",
        data: merchant,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create merchant.";

      return res.status(400).json({
        success: false,
        message,
      });
    }
  }

  // ======================================================
  // GET MY MERCHANT
  // ======================================================

  async getMyMerchant(req: Request, res: Response) {
    try {
      const merchant = await this.merchantsService.getMyMerchant(req.user!.id);

      return res.status(200).json({
        success: true,
        message: "Merchant retrieved successfully.",
        data: merchant,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to retrieve merchant.";

      return res.status(404).json({
        success: false,
        message,
      });
    }
  }

  // ======================================================
  // UPDATE MY MERCHANT
  // ======================================================

  async updateMyMerchant(req: Request, res: Response) {
    try {
      const merchant = await this.merchantsService.updateMyMerchant(
        req.user!.id,
        req.body as UpdateMerchantDTO,
      );

      return res.status(200).json({
        success: true,
        message: "Merchant updated successfully.",
        data: merchant,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update merchant.";

      return res.status(400).json({
        success: false,
        message,
      });
    }
  }

  // ======================================================
  // GET MEMBERS
  // ======================================================

  async getMembers(req: Request, res: Response) {
    try {
      const members = await this.merchantsService.getMembers(req.user!.id);

      return res.status(200).json({
        success: true,
        message: "Merchant members retrieved successfully.",
        data: members,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to retrieve merchant members.";

      return res.status(400).json({
        success: false,
        message,
      });
    }
  }

  // ======================================================
  // ADD MEMBER
  // ======================================================

  async addMember(req: Request, res: Response) {
    try {
      const member = await this.merchantsService.addMember(
        req.user!.id,
        req.body as AddMerchantMemberDTO,
      );

      return res.status(201).json({
        success: true,
        message: "Merchant member added successfully.",
        data: member,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to add merchant member.";

      return res.status(400).json({
        success: false,
        message,
      });
    }
  }

  // ======================================================
  // DEACTIVATE MEMBER
  // ======================================================

  async deactivateMember(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid merchant member ID.",
        });
      }

      const member = await this.merchantsService.deactivateMember(
        req.user!.id,
        id,
      );

      return res.status(200).json({
        success: true,
        message: "Merchant member deactivated successfully.",
        data: member,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to deactivate merchant member.";

      return res.status(400).json({
        success: false,
        message,
      });
    }
  }

  // ======================================================
  // GET SETTINGS
  // ======================================================

  async getSettings(req: Request, res: Response) {
    try {
      const settings = await this.merchantsService.getSettings(req.user!.id);

      return res.status(200).json({
        success: true,
        message: "Merchant settings retrieved successfully.",
        data: settings,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to retrieve merchant settings.";

      return res.status(404).json({
        success: false,
        message,
      });
    }
  }

  // ======================================================
  // UPDATE SETTINGS
  // ======================================================

  async updateSettings(req: Request, res: Response) {
    try {
      const settings = await this.merchantsService.updateSettings(
        req.user!.id,
        req.body as UpdateMerchantSettingsDTO,
      );

      return res.status(200).json({
        success: true,
        message: "Merchant settings updated successfully.",
        data: settings,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update merchant settings.";

      return res.status(400).json({
        success: false,
        message,
      });
    }
  }

  async activateMember(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const memberId = req.params.memberId as string;

      const member = await this.merchantsService.activateMember(
        userId,
        memberId,
      );

      return res.status(200).json({
        success: true,
        message: "Merchant member activated successfully.",
        data: member,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to activate merchant member.",
      });
    }
  }

  async updateMemberRole(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const memberId = req.params.memberId as string;

      const member = await this.merchantsService.updateMemberRole(
        userId,
        memberId,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: "Merchant member role updated successfully.",
        data: member,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update merchant member role.",
      });
    }
  }
}
