import { Router } from "express";

import { ExchangeController } from "./controllers/ExchangeController.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

const exchangeController = new ExchangeController();

router.use(authMiddleware);

router.post(
  "/",
  exchangeController.create.bind(exchangeController),
);

export default router;