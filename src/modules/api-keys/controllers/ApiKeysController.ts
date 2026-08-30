import { Request, Response } from "express";

import { ApiKeysService } from "../services/ApiKeysService.js";

export class ApiKeysController {
  private apiKeysService: ApiKeysService;

  constructor() {
    this.apiKeysService = new ApiKeysService();
  }

  // ======================================================
  // CREATE API KEY
  // ======================================================

  async create(request: Request, response: Response) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return response.status(401).json({
          success: false,
          message: "Unauthorized.",
        });
      }

      const apiKey = await this.apiKeysService.create(userId, request.body);

      return response.status(201).json({
        success: true,
        message: "API key created successfully.",
        data: apiKey,
      });
    } catch (error: any) {
      return response.status(400).json({
        success: false,
        message: error.message || "Failed to create API key.",
      });
    }
  }

  // ======================================================
  // GET ALL MY API KEYS
  // ======================================================

  async findAll(request: Request, response: Response) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return response.status(401).json({
          success: false,
          message: "Unauthorized.",
        });
      }

      const apiKeys = await this.apiKeysService.findAll(userId);

      return response.status(200).json({
        success: true,
        data: apiKeys,
      });
    } catch (error: any) {
      return response.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve API keys.",
      });
    }
  }

  // ======================================================
  // GET API KEY BY ID
  // ======================================================

  async findById(request: Request, response: Response) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return response.status(401).json({
          success: false,
          message: "Unauthorized.",
        });
      }

      const { id } = request.params;

      const apiKey = await this.apiKeysService.findById(userId, id as string);

      return response.status(200).json({
        success: true,
        data: apiKey,
      });
    } catch (error: any) {
      return response.status(404).json({
        success: false,
        message: error.message || "API key not found.",
      });
    }
  }

  // ======================================================
  // REVOKE API KEY
  // ======================================================

  async revoke(request: Request, response: Response) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return response.status(401).json({
          success: false,
          message: "Unauthorized.",
        });
      }

      const { id } = request.params;

      const apiKey = await this.apiKeysService.revoke(userId, id as string);

      return response.status(200).json({
        success: true,
        message: "API key revoked successfully.",
        data: apiKey,
      });
    } catch (error: any) {
      return response.status(404).json({
        success: false,
        message: error.message || "API key not found.",
      });
    }
  }

  // ======================================================
  // DELETE API KEY
  // ======================================================

  async delete(request: Request, response: Response) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return response.status(401).json({
          success: false,
          message: "Unauthorized.",
        });
      }

      const { id } = request.params;

      await this.apiKeysService.delete(userId, id as string);

      return response.status(200).json({
        success: true,
        message: "API key deleted successfully.",
      });
    } catch (error: any) {
      return response.status(404).json({
        success: false,
        message: error.message || "API key not found.",
      });
    }
  }
}
