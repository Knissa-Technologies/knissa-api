import { Router } from "express";
import { UserRole } from "@prisma/client";

import { UsersController } from "./controllers/UsersController.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";

const router = Router();

const usersController = new UsersController();

router.post(
  "/",
  authMiddleware,
  authorize(UserRole.ADMIN),
  usersController.create.bind(usersController),
);

router.get(
  "/",
  authMiddleware,
  authorize(UserRole.ADMIN),
  usersController.list.bind(usersController),
);

router.get(
  "/me",
  authMiddleware,
  usersController.me.bind(usersController),
);

export default router;