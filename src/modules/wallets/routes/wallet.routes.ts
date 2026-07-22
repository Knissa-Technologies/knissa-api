import { Router } from "express";

import { WalletController } from "../controllers/WalletController.js";
import { TransferController } from "../controllers/TransferController.js";

const walletRoutes = Router();

const walletController = new WalletController();
const transferController = new TransferController();

walletRoutes.post("/deposit", walletController.deposit);

walletRoutes.post("/transfer", transferController.handle);

walletRoutes.get(
  "/:accountNumber/statement",
  walletController.statement
);


walletRoutes.post(
  "/open-account",
  walletController.openAccount
);

walletRoutes.post("/withdraw", (req, res) =>
  walletController.withdraw(req, res)
);

export default walletRoutes;