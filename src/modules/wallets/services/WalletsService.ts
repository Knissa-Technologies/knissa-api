import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

import { WalletsRepository } from "../repositories/WalletsRepository.js";

import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";

import type { CreateWalletDTO } from "../dtos/CreateWalletDTO.js";

export class WalletsService {
  private walletsRepository = new WalletsRepository();

  private async getAccountIds(userId: string) {
    const profile = await this.walletsRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    const accounts = await this.walletsRepository.findAccountsByProfileId(
      profile.id,
    );

    return accounts.map((account) => account.id);
  }

  async findAll(userId: string) {
    const accountIds = await this.getAccountIds(userId);

    if (accountIds.length === 0) {
      return [];
    }

    return this.walletsRepository.findAllByAccountIds(accountIds);
  }

  async findById(userId: string, walletId: string) {
    const accountIds = await this.getAccountIds(userId);

    if (accountIds.length === 0) {
      throw new NotFoundError("Wallet not found.");
    }

    const wallet = await this.walletsRepository.findByIdAndAccountIds(
      walletId,
      accountIds,
    );

    if (!wallet) {
      throw new NotFoundError("Wallet not found.");
    }

    return wallet;
  }

  // ======================================================
  // CREATE WALLET
  // ======================================================

  async create(userId: string, data: CreateWalletDTO) {
    const profile = await this.walletsRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    const accounts = await this.walletsRepository.findAccountsByProfileId(
      profile.id,
    );

    if (accounts.length === 0) {
      throw new NotFoundError("Account not found.");
    }

    // Por enquanto usamos a primeira conta do usuário.
    const account = accounts[0];

    const accountData = await this.walletsRepository.findAccountById(
      account.id,
    );

    if (!accountData) {
      throw new NotFoundError("Account not found.");
    }

    if (accountData.status !== "ACTIVE") {
      throw new BadRequestError("Account must be active.");
    }

    // ====================================================
    // CURRENCY
    // ====================================================

    const currency = await this.walletsRepository.findCurrencyById(
      data.currencyId,
    );

    if (!currency) {
      throw new NotFoundError("Currency not found.");
    }

    if (!currency.isActive) {
      throw new BadRequestError("Currency must be active.");
    }

    // ====================================================
    // DUPLICATE WALLET
    // ====================================================

    const existingWallet =
      await this.walletsRepository.findByAccountAndCurrency(
        accountData.id,
        currency.id,
      );

    if (existingWallet) {
      throw new ConflictError(`Wallet for ${currency.code} already exists.`);
    }

    // ====================================================
    // CREATE WALLET
    // ====================================================

    const walletNumber = `WAL-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase()}`;

    return this.walletsRepository.create({
      walletNumber,
      accountId: accountData.id,
      currencyId: currency.id,
      isDefault: false,
    });
  }
}
