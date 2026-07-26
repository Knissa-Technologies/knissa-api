import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";

import { LedgerController } from "./controllers/LedgerController.js";

const router = Router();

const controller = new LedgerController();

router.use(authMiddleware);

router.get("/", controller.index.bind(controller));

router.get(
  "/:walletId",
  controller.show.bind(controller),
);

export default router;