import { Router } from "express";

import { ExchangeRateController } from "../controllers/ExchangeRateController.js";

const exchangeRateRoutes = Router();

const exchangeRateController = new ExchangeRateController();

exchangeRateRoutes.post("/", exchangeRateController.create);

exchangeRateRoutes.get("/", exchangeRateController.findAll);

exchangeRateRoutes.get("/:id", exchangeRateController.findById);

exchangeRateRoutes.patch(
  "/:id",
  exchangeRateController.update
);

exchangeRateRoutes.delete(
  "/:id",
  exchangeRateController.delete
);

export default exchangeRateRoutes;