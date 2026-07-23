import { Router } from "express";

import { ExchangeController } from "../controllers/ExchangeController.js";
import { authMiddleware } from "../../../shared/middlewares/auth.js";

const exchangeRoutes = Router();

const exchangeController = new ExchangeController();

exchangeRoutes.post(
    "/",
    authMiddleware,
    exchangeController.create
);

export default exchangeRoutes;