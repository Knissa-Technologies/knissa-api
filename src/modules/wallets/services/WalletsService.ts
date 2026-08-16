import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

import { WalletsRepository } from "../repositories/WalletsRepository.js";

export class WalletsService {
  private walletsRepository = new WalletsRepository();

  private async getAccountIds(userId: string) {
    const profile =
      await this.walletsRepository.findProfileByUserId(
        userId,
      );

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    const accounts =
      await this.walletsRepository.findAccountsByProfileId(
        profile.id,
      );

    return accounts.map((account) => account.id);
  }

  async findAll(userId: string) {
    const accountIds =
      await this.getAccountIds(userId);

    if (accountIds.length === 0) {
      return [];
    }

    return this.walletsRepository.findAllByAccountIds(
      accountIds,
    );
  }

  async findById(
    userId: string,
    walletId: string,
  ) {
    const accountIds =
      await this.getAccountIds(userId);

    if (accountIds.length === 0) {
      throw new NotFoundError("Wallet not found.");
    }

    const wallet =
      await this.walletsRepository.findByIdAndAccountIds(
        walletId,
        accountIds,
      );

    if (!wallet) {
      throw new NotFoundError("Wallet not found.");
    }

    return wallet;
  }
}
