import { WalletRepository } from "../../wallets/repositories/WalletRepository.js";
import { TransactionRepository } from "../repositories/TransactionRepository.js";

export class GetTransactionsService {
  constructor(
    private readonly walletRepository = new WalletRepository(),
    private readonly transactionRepository = new TransactionRepository(),
  ) {}

  async execute(userId: string) {
    const wallets = await this.walletRepository.findByUserId(userId);

    const transactions = await Promise.all(
      wallets.map((wallet) =>
        this.transactionRepository.findByWallet(wallet.id),
      ),
    );

    return transactions.flat();
  }
}