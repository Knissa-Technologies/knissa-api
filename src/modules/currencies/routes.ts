import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { UserRole } from "@prisma/client";

import { CurrencyController } from "./controllers/CurrencyController.js";
import {
  createCurrencySchema,
  updateCurrencySchema,
} from "./validators/currency.validator.js";

const router = Router();
const controller = new CurrencyController();

router.use(authMiddleware);

router.get("/", controller.index.bind(controller));

router.get("/:code", controller.show.bind(controller));

router.post(
  "/",
  authorize(UserRole.ADMIN),
  validate(createCurrencySchema),
  controller.create.bind(controller),
);

router.put(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(updateCurrencySchema),
  controller.update.bind(controller),
);

router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  controller.delete.bind(controller),
);

export default router;
