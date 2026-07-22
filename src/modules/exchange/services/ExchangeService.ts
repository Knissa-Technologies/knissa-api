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
import { ExchangeRateRepository } from "../../exchange-rates/repositories/ExchangeRateRepository.js";
import { TransactionRepository } from "../../transactions/repositories/TransactionRepository.js";
import { LedgerRepository } from "../../ledger/repositories/LedgerRepository.js";

import { ExchangeDTO } from "../dto/ExchangeDTO.js";


export class ExchangeService {
    async execute(data: ExchangeDTO) {

        const walletRepository = new WalletRepository();
        const exchangeRateRepository = new ExchangeRateRepository();

        // Buscar carteira origem
        const fromWallet = await walletRepository.findById(
            data.fromWalletId
        );

        if (!fromWallet) {
            throw new AppError("Source wallet not found.", 404);
        }

        // Buscar carteira destino
        const toWallet = await walletRepository.findById(
            data.toWalletId
        );

        if (!toWallet) {
            throw new AppError("Destination wallet not found.", 404);
        }

        // Não pode ser a mesma carteira
        if (fromWallet.id === toWallet.id) {
            throw new AppError(
                "Source and destination wallets must be different.",
                400
            );
        }

        // Deve pertencer ao mesmo usuário
        if (fromWallet.userId !== toWallet.userId) {
            throw new AppError(
                "Wallets must belong to the same user.",
                400
            );
        }

        // Ambas devem estar ativas
        if (fromWallet.status !== WalletStatus.ACTIVE) {
            throw new AppError(
                "Source wallet is not active.",
                400
            );
        }

        if (toWallet.status !== WalletStatus.ACTIVE) {
            throw new AppError(
                "Destination wallet is not active.",
                400
            );
        }

        // As moedas precisam ser diferentes
        if (
            fromWallet.currencyId ===
            toWallet.currencyId
        ) {
            throw new AppError(
                "Exchange requires different currencies.",
                400
            );
        }


        // Buscar taxa de câmbio
        const exchangeRate =
            await exchangeRateRepository.findByCurrencies(
                fromWallet.currencyId,
                toWallet.currencyId
            );

        if (!exchangeRate) {
            throw new AppError(
                "Exchange rate not found.",
                404
            );
        }


        const amount = new Prisma.Decimal(data.amount);

        const convertedAmount = amount.mul(exchangeRate.rate);

        const exchangeReference =
            generateTransactionReference();

        const debitReference =
            `${exchangeReference}-D`;

        const creditReference =
            `${exchangeReference}-C`;

        await prisma.$transaction(async (tx) => {

            const txWalletRepository =
                new WalletRepository(tx);

            const txTransactionRepository =
                new TransactionRepository(tx);

            const txLedgerRepository =
                new LedgerRepository(tx);

            // Busca novamente a carteira dentro da transação
            const currentWallet =
                await txWalletRepository.findById(fromWallet.id);

            if (!currentWallet) {
                throw new AppError(
                    "Source wallet not found.",
                    404
                );
            }


            if (currentWallet.balance.lessThan(amount)) {
                throw new AppError("Insufficient balance.", 400);
            }

            await txWalletRepository.decreaseBalance(
                fromWallet.id,
                amount
            );


            // Credita carteira destino
            await txWalletRepository.updateBalanceByAmount(
                toWallet.id,
                convertedAmount
            );

            // Transaction de débito
            const debitTransaction =
                await txTransactionRepository.create({
                    walletId: fromWallet.id,
                    currencyId: fromWallet.currencyId,
                    type: TransactionType.EXCHANGE,
                    amount: amount,
                    netAmount: amount,
                    description: `Exchange ${fromWallet.currency.code} -> ${toWallet.currency.code}`,
                    reference: debitReference,
                });

            // Transaction de crédito
            const creditTransaction =
                await txTransactionRepository.create({
                    walletId: toWallet.id,
                    currencyId: toWallet.currencyId,
                    type: TransactionType.EXCHANGE,
                    amount: convertedAmount,
                    netAmount: convertedAmount,
                    description: `Exchange ${fromWallet.currency.code} -> ${toWallet.currency.code}`,
                    reference: creditReference,
                });

            // Ledger de débito
            await txLedgerRepository.create({
                walletId: fromWallet.id,
                transactionId: debitTransaction.id,
                type: LedgerEntryType.DEBIT,
                amount: amount,
            });

            // Ledger de crédito
            await txLedgerRepository.create({
                walletId: toWallet.id,
                transactionId: creditTransaction.id,
                type: LedgerEntryType.CREDIT,
                amount: convertedAmount,
            });
        });

        const [updatedFromWallet, updatedToWallet] =
            await Promise.all([
                walletRepository.findById(fromWallet.id),
                walletRepository.findById(toWallet.id),
            ]);

        return {
            success: true,
            reference: exchangeReference,
            exchangeRateId: exchangeRate.id,

            from: {
                walletId: fromWallet.id,
                currency: fromWallet.currency.code,
                amount: data.amount,
                balance: updatedFromWallet?.balance,
            },

            to: {
                walletId: toWallet.id,
                currency: toWallet.currency.code,
                amount: convertedAmount,
                balance: updatedToWallet?.balance,
            },

            rate: exchangeRate.rate,

            message: "Exchange completed successfully.",
        };
    }
}
