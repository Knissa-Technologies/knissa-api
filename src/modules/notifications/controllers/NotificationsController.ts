import { Request, Response } from "express";

import { NotificationsService } from "../services/NotificationsService.js";

export class NotificationsController {
  private notificationsService: NotificationsService;

  constructor() {
    this.notificationsService = new NotificationsService();
  }

  // ======================================================
  // CREATE NOTIFICATION
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

      const notification = await this.notificationsService.create(
        userId,
        request.body,
      );

      return response.status(201).json({
        success: true,
        message: "Notification created successfully.",
        data: notification,
      });
    } catch (error: any) {
      return response.status(400).json({
        success: false,
        message: error.message || "Failed to create notification.",
      });
    }
  }

  // ======================================================
  // GET NOTIFICATION BY ID
  // ======================================================

  async getById(request: Request, response: Response) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return response.status(401).json({
          success: false,
          message: "Unauthorized.",
        });
      }

      const { id } = request.params;

      const notification =
        await this.notificationsService.findMyNotificationById(
          userId,
          id as string,
        );

      return response.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      return response.status(404).json({
        success: false,
        message: error.message || "Notification not found.",
      });
    }
  }

  // ======================================================
  // GET MY NOTIFICATIONS
  // ======================================================

  async getByAccount(request: Request, response: Response) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return response.status(401).json({
          success: false,
          message: "Unauthorized.",
        });
      }

      const notifications =
        await this.notificationsService.findMyNotifications(userId);

      return response.status(200).json({
        success: true,
        message: "Notifications retrieved successfully.",
        data: notifications,
      });
    } catch (error: any) {
      return response.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve notifications.",
      });
    }
  }

  // ======================================================
  // GET MY UNREAD COUNT
  // ======================================================

  async getUnreadCount(request: Request, response: Response) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return response.status(401).json({
          success: false,
          message: "Unauthorized.",
        });
      }

      const result = await this.notificationsService.getUnreadCount(userId);

      return response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return response.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve unread count.",
      });
    }
  }

  // ======================================================
  // MARK MY NOTIFICATION AS READ
  // ======================================================

  async markAsRead(request: Request, response: Response) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return response.status(401).json({
          success: false,
          message: "Unauthorized.",
        });
      }

      const { id } = request.params;

      const notification =
        await this.notificationsService.markMyNotificationAsRead(
          userId,
          id as string,
        );

      return response.status(200).json({
        success: true,
        message: "Notification marked as read successfully.",
        data: notification,
      });
    } catch (error: any) {
      return response.status(404).json({
        success: false,
        message: error.message || "Notification not found.",
      });
    }
  }
}
