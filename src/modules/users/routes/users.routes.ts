import { Router } from "express";

import { UserRole } from "@prisma/client";

import { UsersController } from "../controllers/UsersController.js";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";
import { requireRole } from "../../../shared/middlewares/requireRole.js";
import type { IdParams } from "../../../shared/http/RouteParams.js";

const router = Router();

const usersController = new UsersController();

router.use(authMiddleware);

// ======================================================
// READ — ADMIN + SUPPORT
// ======================================================

router.get(
  "/",
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  (req, res) => usersController.findAll(req, res),
);

router.get<IdParams>(
  "/:id",
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  (req, res) => usersController.findById(req, res),
);

// ======================================================
// WRITE — ADMIN ONLY
// ======================================================

router.patch<IdParams>(
  "/:id",
  requireRole(UserRole.ADMIN),
  (req, res) => usersController.update(req, res),
);

router.delete<IdParams>(
  "/:id",
  requireRole(UserRole.ADMIN),
  (req, res) => usersController.delete(req, res),
);

export default router;