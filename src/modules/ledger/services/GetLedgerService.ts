import { WalletRepository } from "../../wallets/repositories/WalletRepository.js";

import { LedgerRepository } from "../repositories/LedgerRepository.js";

export class GetLedgerService {
  constructor(
    private readonly walletRepository = new WalletRepository(),
    private readonly ledgerRepository = new LedgerRepository(),
  ) {}

  async execute(userId: string) {
    const wallets = await this.walletRepository.findByUserId(userId);

    const entries = await this.ledgerRepository.findByWallets(
      wallets.map((wallet) => wallet.id),
    );

    return entries;
  }
}