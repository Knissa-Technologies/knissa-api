import { Router } from "express";
import { UserRole } from "@prisma/client";

import { ExchangeRateController } from "./controllers/ExchangeRateController.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";


const router = Router();

const exchangeRateController = new ExchangeRateController();

router.use(authMiddleware);

router.get(
  "/",
  exchangeRateController.findAll.bind(exchangeRateController),
);

router.get(
  "/:id",
  exchangeRateController.findById.bind(exchangeRateController),
);

router.post(
  "/",
  authorize(UserRole.ADMIN),
  exchangeRateController.create.bind(exchangeRateController),
);

router.put(
  "/:id",
  authorize(UserRole.ADMIN),
  exchangeRateController.update.bind(exchangeRateController),
);

router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  exchangeRateController.delete.bind(exchangeRateController),
);

export default router;