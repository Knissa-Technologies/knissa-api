import { Router } from "express";

import { PaymentController } from "../controllers/PaymentController.js";
import { authMiddleware } from "../../../shared/middlewares/auth.js";

const paymentRoutes = Router();

const paymentController = new PaymentController();

paymentRoutes.post(
    "/",
    authMiddleware,
    paymentController.create
);


export default paymentRoutes;