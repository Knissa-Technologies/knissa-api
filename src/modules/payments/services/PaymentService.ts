import {
    LedgerEntryType,
    Prisma,
    TransactionType,
    WalletStatus,
} from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { generateTransactionReference } from "../../../shared/utils/generateTransactionReference.js";

import { WalletRepository } from "../../wallets/repositories/WalletRepository.js";
import { TransactionRepository } from "../../transactions/repositories/TransactionRepository.js";
import { LedgerRepository } from "../../ledger/repositories/LedgerRepository.js";

import { PaymentDTO } from "../dto/PaymentDTO.js";

export class PaymentService {
    async execute(data: PaymentDTO) {

        const walletRepository = new WalletRepository();

        // Buscar carteira
        const wallet = await walletRepository.findById(data.walletId);

        if (!wallet) {
            throw new AppError("Wallet not found.", 404);
        }

        // Carteira ativa
        if (wallet.status !== WalletStatus.ACTIVE) {
            throw new AppError("Wallet is not active.", 400);
        }

        const amount = new Prisma.Decimal(data.amount);

        const reference = generateTransactionReference();

        await prisma.$transaction(async (tx) => {

            const txWalletRepository =
                new WalletRepository(tx);

            const txTransactionRepository =
                new TransactionRepository(tx);

            const txLedgerRepository =
                new LedgerRepository(tx);

            // Buscar novamente dentro da transação
            const currentWallet =
                await txWalletRepository.findById(wallet.id);

            if (!currentWallet) {
                throw new AppError("Wallet not found.", 404);
            }

            if (currentWallet.balance.lessThan(amount)) {
                throw new AppError("Insufficient balance.", 400);
            }

            // Debitar saldo
            await txWalletRepository.decreaseBalance(
                wallet.id,
                amount
            );

            // Criar transaction
            const transaction =
                await txTransactionRepository.create({
                    walletId: wallet.id,
                    currencyId: wallet.currencyId,
                    type: TransactionType.PAYMENT,
                    amount,
                    netAmount: amount,
                    description:
                        data.description ??
                        `Payment to ${data.beneficiary}`,
                    reference,
                });

            // Criar ledger
            await txLedgerRepository.create({
                walletId: wallet.id,
                transactionId: transaction.id,
                type: LedgerEntryType.DEBIT,
                amount,
            });

        });

        const updatedWallet =
            await walletRepository.findById(wallet.id);

        return {
            success: true,
            reference,

            wallet: {
                id: wallet.id,
                currency: wallet.currency.code,
                balance: updatedWallet?.balance,
            },

            beneficiary: data.beneficiary,

            amount,

            message: "Payment completed successfully.",
        };
    }
}