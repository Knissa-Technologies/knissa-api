import { AppError } from "../../../shared/errors/AppError.js";

import { WalletRepository } from "../repositories/WalletRepository.js";
import { TransactionRepository } from "../../transactions/repositories/TransactionRepository.js";

export class StatementService {
  constructor(
    private readonly walletRepository = new WalletRepository(),
    private readonly transactionRepository = new TransactionRepository()
  ) {}

  async execute(accountNumber: string) {
    const wallet =
      await this.walletRepository.findByAccountNumberWithCurrency(
        accountNumber
      );

    if (!wallet) {
      throw new AppError("Wallet not found.", 404);
    }

    const transactions =
      await this.transactionRepository.findByWallet(wallet.id);

    return {
      wallet: {
        accountNumber: wallet.accountNumber,
        balance: Number(wallet.balance),
        currency: wallet.currency.code,
        status: wallet.status,
      },
      transactions,
    };
  }
}