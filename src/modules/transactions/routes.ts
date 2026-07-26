import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";

import { TransactionController } from "./controllers/TransactionController.js";

const router = Router();

const controller = new TransactionController();

router.use(authMiddleware);

router.get("/", controller.index.bind(controller));

router.get(
  "/:reference",
  controller.show.bind(controller),
);

export default router;