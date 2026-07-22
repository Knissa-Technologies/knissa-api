import { Router } from "express";
import { WalletController } from "../controllers/WalletController.js";

const walletRoutes = Router();

const walletController = new WalletController();

walletRoutes.post("/deposit", walletController.deposit);

// NOVA ROTA
walletRoutes.get(
  "/:accountNumber/statement",
  walletController.statement
);

export default walletRoutes;