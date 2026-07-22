import {
  LedgerEntryType,
  TransactionType,
} from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";

import { AppError } from "../../../shared/errors/AppError.js";
import { generateTransactionReference } from "../../../shared/utils/generateTransactionReference.js";

import { DepositDTO } from "../dto/DepositDTO.js";
import { WalletRepository } from "../repositories/WalletRepository.js";
import { TransactionRepository } from "../../transactions/repositories/TransactionRepository.js";
import { LedgerRepository } from "../../ledger/repositories/LedgerRepository.js";
import { depositSchema } from "../validators/deposit.schema.js";

export class DepositService {
  async execute(data: DepositDTO) {
    const input = depositSchema.parse(data);

    return await prisma.$transaction(async (tx) => {
      const walletRepository = new WalletRepository(tx);
      const transactionRepository = new TransactionRepository(tx);
      const ledgerRepository = new LedgerRepository(tx);

      const wallet = await walletRepository.findByAccountNumber(
        input.accountNumber
      );

      if (!wallet) {
        throw new AppError("Wallet not found.", 404);
      }

      const newBalance = Number(wallet.balance) + input.amount;

      const updatedWallet = await walletRepository.updateBalance(
        wallet.id,
        newBalance
      );

      const transaction = await transactionRepository.create({
        walletId: wallet.id,
        currencyId: wallet.currencyId,
        type: TransactionType.DEPOSIT,
        amount: input.amount,
        feeAmount: 0,
        netAmount: input.amount,
        description: "Wallet deposit",
        reference: generateTransactionReference(),
      });

      await ledgerRepository.create({
        walletId: wallet.id,
        transactionId: transaction.id,
        type: LedgerEntryType.CREDIT,
        amount: input.amount,
      });

      return updatedWallet;
    });
  }
}