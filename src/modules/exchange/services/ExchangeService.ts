import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

import type { CreateExchangeQuoteDTO } from "../dtos/CreateExchangeQuoteDTO.js";

import { ExchangeRepository } from "../repositories/ExchangeRepository.js";

import { generateLedgerEntryNumber } from "../../../shared/utils/generateLedgerEntryNumber.js";
import { generateTransactionNumber } from "../../../shared/utils/generateTransactionNumber.js";

import type { AcceptExchangeQuoteDTO } from "../dtos/AcceptExchangeQuoteDTO.js";

import type { FindExchangeByIdDTO } from "../dtos/FindExchangeByIdDTO.js";

export class ExchangeService {
  private exchangeRepository = new ExchangeRepository();

  // ======================================================
  // CREATE EXCHANGE QUOTE
  // ======================================================

  async createQuote(userId: string, data: CreateExchangeQuoteDTO) {
    // ====================================================
    // ACCOUNT
    // ====================================================

    const account = await this.exchangeRepository.findAccountByUserId(userId);

    if (!account) {
      throw new NotFoundError("Account not found.");
    }

    if (account.status !== "ACTIVE") {
      throw new BadRequestError("Account must be active.");
    }

    // ====================================================
    // SOURCE WALLET
    // ====================================================

    const sourceWallet = await this.exchangeRepository.findWalletById(
      data.sourceWalletId,
    );

    if (!sourceWallet) {
      throw new NotFoundError("Source wallet not found.");
    }

    // Segurança:
    // A wallet precisa pertencer ao usuário autenticado.

    if (sourceWallet.accountId !== account.id) {
      throw new NotFoundError("Source wallet not found.");
    }

    if (sourceWallet.status !== "ACTIVE") {
      throw new BadRequestError("Source wallet must be active.");
    }

    // ====================================================
    // DESTINATION WALLET
    // ====================================================

    const destinationWallet = await this.exchangeRepository.findWalletById(
      data.destinationWalletId,
    );

    if (!destinationWallet) {
      throw new NotFoundError("Destination wallet not found.");
    }

    // Segurança

    if (destinationWallet.accountId !== account.id) {
      throw new NotFoundError("Destination wallet not found.");
    }

    if (destinationWallet.status !== "ACTIVE") {
      throw new BadRequestError("Destination wallet must be active.");
    }

    // ====================================================
    // CURRENCY VALIDATION
    // ====================================================

    if (sourceWallet.currencyId === destinationWallet.currencyId) {
      throw new BadRequestError(
        "Source and destination currencies must be different.",
      );
    }

    if (!sourceWallet.currency.isActive) {
      throw new BadRequestError("Source currency must be active.");
    }

    if (!destinationWallet.currency.isActive) {
      throw new BadRequestError("Destination currency must be active.");
    }

    // ====================================================
    // AMOUNT VALIDATION
    // ====================================================

    const sourceAmount = Number(data.sourceAmount);

    if (!Number.isFinite(sourceAmount) || sourceAmount <= 0) {
      throw new BadRequestError("Source amount must be greater than zero.");
    }

    // ====================================================
    // EXCHANGE RATE
    // ====================================================

    const exchangeRate = await this.exchangeRepository.findActiveExchangeRate(
      sourceWallet.currencyId,
      destinationWallet.currencyId,
    );

    if (!exchangeRate) {
      throw new NotFoundError(
        `Exchange rate not found for ${sourceWallet.currency.code} to ${destinationWallet.currency.code}.`,
      );
    }

    // ====================================================
    // CALCULATE DESTINATION AMOUNT
    // ====================================================

    const rate = Number(exchangeRate.rate);

    const destinationAmount = sourceAmount * rate;

    // ====================================================
    // EXCHANGE FEE
    // ====================================================

    const exchangeFee = 0;

    // ====================================================
    // QUOTE EXPIRATION
    // ====================================================

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // ====================================================
    // CREATE QUOTE
    // ====================================================

    const quoteNumber = `QUOTE-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase()}`;

    return this.exchangeRepository.createQuote({
      quoteNumber,

      accountId: account.id,

      exchangeRateId: exchangeRate.id,

      sourceWalletId: sourceWallet.id,

      destinationWalletId: destinationWallet.id,

      sourceAmount: sourceAmount.toFixed(8),

      destinationAmount: destinationAmount.toFixed(8),

      exchangeFee: exchangeFee.toFixed(8),

      expiresAt,
    });
  }

  // ======================================================
  // ACCEPT EXCHANGE QUOTE
  // ======================================================

  async acceptQuote(userId: string, data: AcceptExchangeQuoteDTO) {
    // ====================================================
    // ACCOUNT
    // ====================================================

    const account = await this.exchangeRepository.findAccountByUserId(userId);

    if (!account) {
      throw new NotFoundError("Account not found.");
    }

    if (account.status !== "ACTIVE") {
      throw new BadRequestError("Account must be active.");
    }

    // ====================================================
    // FIND QUOTE
    // ====================================================

    const quote = await this.exchangeRepository.findQuoteById(data.quoteId);

    if (!quote) {
      throw new NotFoundError("Exchange quote not found.");
    }

    // ====================================================
    // SECURITY
    // ====================================================

    if (quote.accountId !== account.id) {
      throw new NotFoundError("Exchange quote not found.");
    }

    // ====================================================
    // QUOTE STATUS
    // ====================================================

    if (quote.status !== "ACTIVE") {
      throw new BadRequestError("Exchange quote is no longer active.");
    }

    // ====================================================
    // EXPIRATION
    // ====================================================

    if (quote.expiresAt <= new Date()) {
      throw new BadRequestError("Exchange quote has expired.");
    }

    // ====================================================
    // WALLET STATUS
    // ====================================================

    if (quote.sourceWallet.status !== "ACTIVE") {
      throw new BadRequestError("Source wallet must be active.");
    }

    if (quote.destinationWallet.status !== "ACTIVE") {
      throw new BadRequestError("Destination wallet must be active.");
    }

    // ====================================================
    // BALANCE
    // ====================================================

    const sourceAmount = Number(quote.sourceAmount);

    if (quote.sourceWallet.availableBalance.toNumber() < sourceAmount) {
      throw new BadRequestError("Insufficient wallet balance.");
    }

    // ====================================================
    // EXECUTE EXCHANGE
    // ====================================================

    const exchangeNumber = `EXC-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase()}`;

    return this.exchangeRepository.executeExchange({
      exchangeNumber,

      transactionNumber: generateTransactionNumber(),

      quoteId: quote.id,

      exchangeRateId: quote.exchangeRateId,

      sourceWalletId: quote.sourceWalletId,

      destinationWalletId: quote.destinationWalletId,

      sourceCurrencyId: quote.sourceWallet.currencyId,

      destinationCurrencyId: quote.destinationWallet.currencyId,

      sourceAmount: quote.sourceAmount.toFixed(8),

      destinationAmount: quote.destinationAmount.toFixed(8),

      exchangeFee: quote.exchangeFee.toFixed(8),

      sourceLedgerNumber: generateLedgerEntryNumber(),

      destinationLedgerNumber: generateLedgerEntryNumber(),
    });
  }

  // ======================================================
  // FIND ALL EXCHANGES
  // ======================================================

  async findAll(userId: string) {
    return this.exchangeRepository.findAllByUserId(userId);
  }

  // ======================================================
  // FIND EXCHANGE BY ID
  // ======================================================

  async findById(userId: string, data: FindExchangeByIdDTO) {
    const exchange = await this.exchangeRepository.findByIdAndUserId(
      data.id,
      userId,
    );

    if (!exchange) {
      throw new NotFoundError("Exchange not found.");
    }

    return exchange;
  }
}
