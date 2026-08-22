import { Prisma } from "@prisma/client";

import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

import { generateLedgerEntryNumber } from "../../../shared/utils/generateLedgerEntryNumber.js";
import { generateTransactionNumber } from "../../../shared/utils/generateTransactionNumber.js";

import type { CreateDepositDTO } from "../dtos/CreateDepositDTO.js";
import type { CreateTransferDTO } from "../dtos/CreateTransferDTO.js";

import type { FindTransactionsQueryDTO } from "../dtos/FindTransactionsQueryDTO.js";

import { TransactionsRepository } from "../repositories/TransactionsRepository.js";

export class TransactionsService {
  private transactionsRepository = new TransactionsRepository();

  /**
   * Normalizes monetary values to 8 decimal places.
   */
  private normalizeAmount(value: string | Prisma.Decimal) {
    return new Prisma.Decimal(value).toFixed(8);
  }

  /**
   * Returns all wallets owned by the authenticated user.
   */
  private async getWalletIds(userId: string) {
    const profile =
      await this.transactionsRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    const accounts =
      await this.transactionsRepository.findAccountsByProfileId(
        profile.id,
      );

    if (accounts.length === 0) {
      return [];
    }

    const accountIds = accounts.map((account) => account.id);

    const wallets =
      await this.transactionsRepository.findWalletsByAccountIds(accountIds);

    return wallets.map((wallet) => wallet.id);
  }

  /**
   * List transactions belonging to the authenticated user's wallets.
   * Supports pagination and filters.
   */
  async findAll(userId: string, query: FindTransactionsQueryDTO) {
    const walletIds = await this.getWalletIds(userId);

    const page = Math.max(Number(query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(query.limit) || 10, 1),
      100,
    );

    if (walletIds.length === 0) {
      return {
        transactions: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    const skip = (page - 1) * limit;

    const result =
      await this.transactionsRepository.findAllByWalletIds(
        walletIds,
        {
          skip,
          take: limit,
          type: query.type,
          status: query.status,
        },
      );

    const totalPages = Math.ceil(result.total / limit);

    return {
      transactions: result.transactions,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Find a transaction belonging to the authenticated user's wallets.
   */
  async findById(userId: string, transactionId: string) {
    const walletIds = await this.getWalletIds(userId);

    if (walletIds.length === 0) {
      throw new NotFoundError("Transaction not found.");
    }

    const transaction =
      await this.transactionsRepository.findByIdAndWalletIds(
        transactionId,
        walletIds,
      );

    if (!transaction) {
      throw new NotFoundError("Transaction not found.");
    }

    return transaction;
  }

  /**
   * Transfer funds from the authenticated user's wallet
   * to another active wallet.
   */
  async transfer(userId: string, data: CreateTransferDTO) {
    const walletIds = await this.getWalletIds(userId);

    if (walletIds.length === 0) {
      throw new NotFoundError("Wallet not found.");
    }

    // ------------------------------------------------------
    // Basic validation
    // ------------------------------------------------------

    if (data.sourceWalletId === data.destinationWalletId) {
      throw new BadRequestError(
        "Source and destination wallets must be different.",
      );
    }

    if (!data.idempotencyKey?.trim()) {
      throw new BadRequestError("Idempotency key is required.");
    }

    if (!/^\d+(\.\d{1,8})?$/.test(data.amount)) {
      throw new BadRequestError(
        "Transfer amount must have up to 8 decimal places.",
      );
    }

    const amount = Number(data.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestError(
        "Transfer amount must be greater than zero.",
      );
    }

    // ------------------------------------------------------
    // Source wallet ownership
    // ------------------------------------------------------

    if (!walletIds.includes(data.sourceWalletId)) {
      throw new NotFoundError("Source wallet not found.");
    }

    // ------------------------------------------------------
    // Idempotency
    // ------------------------------------------------------

    const idempotencyKey = data.idempotencyKey.trim();

    const existingTransaction =
      await this.transactionsRepository.findByIdempotencyKey(
        idempotencyKey,
      );

    if (existingTransaction) {
      const sameTransaction =
        existingTransaction.type === "TRANSFER" &&
        existingTransaction.sourceWalletId === data.sourceWalletId &&
        existingTransaction.destinationWalletId ===
          data.destinationWalletId &&
        this.normalizeAmount(existingTransaction.amount) ===
          this.normalizeAmount(data.amount);

      if (!sameTransaction) {
        throw new ConflictError(
          "Idempotency key has already been used for another transfer.",
        );
      }

      return existingTransaction;
    }

    // ------------------------------------------------------
    // Load source wallet
    // ------------------------------------------------------

    const sourceWallet =
      await this.transactionsRepository.findWalletById(
        data.sourceWalletId,
      );

    if (!sourceWallet) {
      throw new NotFoundError("Source wallet not found.");
    }

    // ------------------------------------------------------
    // Load destination wallet
    // ------------------------------------------------------

    const destinationWallet =
      await this.transactionsRepository.findWalletById(
        data.destinationWalletId,
      );

    if (!destinationWallet) {
      throw new NotFoundError("Destination wallet not found.");
    }

    // ------------------------------------------------------
    // Wallet status
    // ------------------------------------------------------

    if (
      sourceWallet.status !== "ACTIVE" ||
      destinationWallet.status !== "ACTIVE"
    ) {
      throw new BadRequestError("Both wallets must be active.");
    }

    // ------------------------------------------------------
    // Currency
    // ------------------------------------------------------

    if (sourceWallet.currencyId !== destinationWallet.currencyId) {
      throw new BadRequestError(
        "Source and destination wallets must use the same currency.",
      );
    }

    // ------------------------------------------------------
    // Balance
    // ------------------------------------------------------

    if (sourceWallet.availableBalance.toNumber() < amount) {
      throw new BadRequestError("Insufficient wallet balance.");
    }

    // ------------------------------------------------------
    // Execute transfer
    // ------------------------------------------------------

    return this.transactionsRepository.transfer({
      transactionNumber: generateTransactionNumber(),

      sourceWalletId: data.sourceWalletId,

      destinationWalletId: data.destinationWalletId,

      currencyId: sourceWallet.currencyId,

      amount: data.amount,

      description: data.description?.trim() || undefined,

      idempotencyKey,

      sourceLedgerNumber: generateLedgerEntryNumber(),

      destinationLedgerNumber: generateLedgerEntryNumber(),
    });
  }

  /**
   * Development/test deposit.
   *
   * This operation is disabled in production.
   */
  async deposit(_adminUserId: string, data: CreateDepositDTO) {
    // ------------------------------------------------------
    // Environment protection
    // ------------------------------------------------------

    if (process.env.NODE_ENV === "production") {
      throw new BadRequestError(
        "Test deposits are disabled in production.",
      );
    }

    // ------------------------------------------------------
    // Basic validation
    // ------------------------------------------------------

    if (!data.idempotencyKey?.trim()) {
      throw new BadRequestError("Idempotency key is required.");
    }

    if (!data.destinationWalletId?.trim()) {
      throw new BadRequestError("Destination wallet is required.");
    }

    if (!/^\d+(\.\d{1,8})?$/.test(data.amount)) {
      throw new BadRequestError(
        "Deposit amount must have up to 8 decimal places.",
      );
    }

    const amount = Number(data.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestError(
        "Deposit amount must be greater than zero.",
      );
    }

    const idempotencyKey = data.idempotencyKey.trim();

    // ------------------------------------------------------
    // Idempotency
    // ------------------------------------------------------

    const existingTransaction =
      await this.transactionsRepository.findByIdempotencyKey(
        idempotencyKey,
      );

    if (existingTransaction) {
      const sameDeposit =
        existingTransaction.type === "DEPOSIT" &&
        existingTransaction.destinationWalletId ===
          data.destinationWalletId &&
        this.normalizeAmount(existingTransaction.amount) ===
          this.normalizeAmount(data.amount);

      if (!sameDeposit) {
        throw new ConflictError(
          "Idempotency key has already been used for another deposit.",
        );
      }

      return existingTransaction;
    }

    // ------------------------------------------------------
    // Destination wallet
    // ------------------------------------------------------

    const wallet =
      await this.transactionsRepository.findWalletById(
        data.destinationWalletId,
      );

    if (!wallet) {
      throw new NotFoundError("Destination wallet not found.");
    }

    // ------------------------------------------------------
    // Wallet status
    // ------------------------------------------------------

    if (wallet.status !== "ACTIVE") {
      throw new BadRequestError(
        "Destination wallet must be active.",
      );
    }

    // ------------------------------------------------------
    // Execute deposit
    // ------------------------------------------------------

    return this.transactionsRepository.deposit({
      transactionNumber: generateTransactionNumber(),

      destinationWalletId: data.destinationWalletId,

      currencyId: wallet.currencyId,

      amount: data.amount,

      description: data.description?.trim() || undefined,

      idempotencyKey,

      ledgerNumber: generateLedgerEntryNumber(),
    });
  }
}