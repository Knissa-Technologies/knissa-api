import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";

import { CountryController } from "./controllers/CountryController.js";

const router = Router();

const controller = new CountryController();

router.use(authMiddleware);

router.get("/", (req, res, next) => {
  console.log(">>> GET /countries chegou na rota");
  return controller.index(req, res, next);
});

// Todos os usuários autenticados
router.get("/", controller.index.bind(controller));
router.get("/:id", controller.show.bind(controller));

// Somente administradores
router.post("/", authorize(UserRole.ADMIN), controller.create.bind(controller));

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
