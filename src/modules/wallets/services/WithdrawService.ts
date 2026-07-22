import {
  LedgerEntryType,
  TransactionType,
} from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";
import { AppError } from "../../../shared/errors/AppError.js";

import { generateTransactionReference } from "../../../shared/utils/generateTransactionReference.js";

import { WalletRepository } from "../repositories/WalletRepository.js";
import { TransactionRepository } from "../../transactions/repositories/TransactionRepository.js";
import { LedgerRepository } from "../../ledger/repositories/LedgerRepository.js";

import { WithdrawDTO } from "../dto/WithdrawDTO.js";

export class WithdrawService {
  async execute(data: WithdrawDTO) {
    const walletRepository = new WalletRepository();

    const wallet = await walletRepository.findByAccountNumber(
      data.accountNumber
    );

    if (!wallet) {
      throw new AppError("Wallet not found.", 404);
    }

    if (wallet.status !== "ACTIVE") {
      throw new AppError("Wallet is not active.", 400);
    }

    if (Number(wallet.balance) < data.amount) {
      throw new AppError("Insufficient balance.", 400);
    }

    const reference = generateTransactionReference();

    await prisma.$transaction(async (tx) => {
      const walletRepository = new WalletRepository(tx);
      const transactionRepository = new TransactionRepository(tx);
      const ledgerRepository = new LedgerRepository(tx);

      await walletRepository.updateBalance(
        wallet.id,
        Number(wallet.balance) - data.amount
      );

      const transaction = await transactionRepository.create({
        walletId: wallet.id,
        currencyId: wallet.currencyId,
        type: TransactionType.WITHDRAWAL,
        amount: data.amount,
        netAmount: data.amount,
        description: "Wallet withdrawal",
        reference,
      });

      await ledgerRepository.create({
        walletId: wallet.id,
        transactionId: transaction.id,
        type: LedgerEntryType.DEBIT,
        amount: data.amount,
      });
    });

    return {
      success: true,
      reference,
      message: "Withdrawal completed successfully.",
    };
  }
}