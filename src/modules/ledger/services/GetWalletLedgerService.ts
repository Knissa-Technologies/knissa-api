import { AppError } from "../../../shared/errors/AppError.js";

import { WalletRepository } from "../../wallets/repositories/WalletRepository.js";

import { LedgerRepository } from "../repositories/LedgerRepository.js";

export class GetWalletLedgerService {
  constructor(
    private readonly walletRepository = new WalletRepository(),
    private readonly ledgerRepository = new LedgerRepository(),
  ) {}

  async execute(walletId: string) {
    const wallet = await this.walletRepository.findById(walletId);

    if (!wallet) {
      throw new AppError("Wallet not found.", 404);
    }

    return this.ledgerRepository.findByWallet(walletId);
  }
}