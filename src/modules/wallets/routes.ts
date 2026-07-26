import { Router } from "express";

import { WalletController } from "./controllers/WalletController.js";
import { TransferController } from "./controllers/TransferController.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

const walletController = new WalletController();
const transferController = new TransferController();

router.use(authMiddleware);

router.get("/", walletController.index.bind(walletController));

router.post(
  "/open-account",
  walletController.openAccount.bind(walletController),
);

router.post("/deposit", walletController.deposit.bind(walletController));

router.post("/withdraw", walletController.withdraw.bind(walletController));

router.get(
  "/statement/:accountNumber",
  walletController.statement.bind(walletController),
);

router.post("/transfer", transferController.handle.bind(transferController));

export default router;
