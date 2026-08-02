import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";

import { CountryController } from "./controllers/CountryController.js";

const router = Router();

const controller = new CountryController();

// ======================================
// Rotas públicas
// ======================================

router.get("/", controller.index.bind(controller));
router.get("/:id", controller.show.bind(controller));

// ======================================
// A partir daqui exige autenticação
// ======================================

router.use(authMiddleware);

// ======================================
// Somente ADMIN
// ======================================

router.post(
  "/",
  authorize(UserRole.ADMIN),
  controller.create.bind(controller),
);

router.put(
  "/:id",
  authorize(UserRole.ADMIN),
  controller.update.bind(controller),
);

router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  controller.delete.bind(controller),
);

export default router;