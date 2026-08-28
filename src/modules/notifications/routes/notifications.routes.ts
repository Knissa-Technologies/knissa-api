import { Router } from "express";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";

import type { IdParams } from "../../../shared/http/RouteParams.js";

import { NotificationsController } from "../controllers/NotificationsController.js";

const router = Router();

const notificationsController = new NotificationsController();

router.use(authMiddleware);

// ======================================================
// CURRENT USER NOTIFICATIONS
// ======================================================

router.get(
  "/",
  (req, res) =>
    notificationsController.getByAccount(req, res),
);

router.get(
  "/unread-count",
  (req, res) =>
    notificationsController.getUnreadCount(req, res),
);

router.get<IdParams>(
  "/:id",
  (req, res) =>
    notificationsController.getById(req, res),
);

router.patch<IdParams>(
  "/:id/read",
  (req, res) =>
    notificationsController.markAsRead(req, res),
);

router.post(
  "/",
  (req, res) =>
    notificationsController.create(req, res),
);

export default router;
