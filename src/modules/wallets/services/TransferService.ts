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

import { TransferDTO } from "../dto/TransferDTO.js";

export class TransferService {
  async execute(data: TransferDTO) {
    const originWallet = await new WalletRepository().findByAccountNumber(
      data.fromAccount
    );

    if (!originWallet) {
      throw new AppError("Origin wallet not found.", 404);
    }

    const destinationWallet =
      await new WalletRepository().findByAccountNumber(
        data.toAccount
      );

    if (!destinationWallet) {
      throw new AppError("Destination wallet not found.", 404);
    }

    if (originWallet.id === destinationWallet.id) {
      throw new AppError(
        "Origin and destination wallets must be different.",
        400
      );
    }

    if (originWallet.currencyId !== destinationWallet.currencyId) {
      throw new AppError(
        "Transfers between different currencies are not allowed.",
        400
      );
    }

    if (Number(originWallet.balance) < data.amount) {
      throw new AppError("Insufficient balance.", 400);
    }

    const transferReference = generateTransactionReference();

    const debitReference = `${transferReference}-D`;
    const creditReference = `${transferReference}-C`;

    await prisma.$transaction(async (tx) => {
      const walletRepository = new WalletRepository(tx);
      const transactionRepository = new TransactionRepository(tx);
      const ledgerRepository = new LedgerRepository(tx);

      // Debita origem
      await walletRepository.updateBalance(
        originWallet.id,
        Number(originWallet.balance) - data.amount
      );

      // Credita destino
      await walletRepository.updateBalance(
        destinationWallet.id,
        Number(destinationWallet.balance) + data.amount
      );

      // Transaction de saída
      const debitTransaction =
        await transactionRepository.create({
          walletId: originWallet.id,
          currencyId: originWallet.currencyId,
          type: TransactionType.TRANSFER,
          amount: data.amount,
          netAmount: data.amount,
          description: `Transfer to ${destinationWallet.accountNumber}`,
          reference: debitReference,
        });

      // Transaction de entrada
      const creditTransaction =
        await transactionRepository.create({
          walletId: destinationWallet.id,
          currencyId: destinationWallet.currencyId,
          type: TransactionType.TRANSFER,
          amount: data.amount,
          netAmount: data.amount,
          description: `Transfer from ${originWallet.accountNumber}`,
          reference: creditReference,
        });

      // Ledger débito
      await ledgerRepository.create({
        walletId: originWallet.id,
        transactionId: debitTransaction.id,
        type: LedgerEntryType.DEBIT,
        amount: data.amount,
      });

      // Ledger crédito
      await ledgerRepository.create({
        walletId: destinationWallet.id,
        transactionId: creditTransaction.id,
        type: LedgerEntryType.CREDIT,
        amount: data.amount,
      });
    });

    return {
      success: true,
      reference: transferReference,
      message: "Transfer completed successfully.",
    }
  };
}