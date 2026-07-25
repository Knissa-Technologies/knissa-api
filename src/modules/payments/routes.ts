import { Router } from "express";

import { PaymentController } from "./controllers/PaymentController.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

const paymentController = new PaymentController();

router.use(authMiddleware);

router.post("/", paymentController.create.bind(paymentController));

export default router;