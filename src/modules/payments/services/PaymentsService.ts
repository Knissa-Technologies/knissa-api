import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

import type { CreatePaymentDTO } from "../dtos/CreatePaymentDTO.js";
import type { RefundPaymentDTO } from "../dtos/RefundPaymentDTO.js";

import { PaymentsRepository } from "../repositories/PaymentsRepository.js";

import { generatePaymentNumber } from "../../../shared/utils/generatePaymentNumber.js";
import { generateTransactionNumber } from "../../../shared/utils/generateTransactionNumber.js";
import { generateLedgerEntryNumber } from "../../../shared/utils/generateLedgerEntryNumber.js";

export class PaymentsService {
  private paymentsRepository = new PaymentsRepository();

  // ======================================================
  // CREATE PAYMENT
  // ======================================================

  async create(userId: string, data: CreatePaymentDTO) {
    // ====================================================
    // PROFILE
    // ====================================================

    const profile =
      await this.paymentsRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    // ====================================================
    // IDEMPOTENCY
    // ====================================================

    const existingPayment =
      await this.paymentsRepository.findByIdempotencyKey(
        data.idempotencyKey,
      );

    if (existingPayment) {
      if (existingPayment.accountId !== data.accountId) {
        throw new ConflictError(
          "Idempotency key has already been used by another account.",
        );
      }

      return existingPayment;
    }

    // ====================================================
    // ACCOUNT
    // ====================================================

    const account =
      await this.paymentsRepository.findAccountById(
        data.accountId,
      );

    if (!account || account.profileId !== profile.id) {
      throw new NotFoundError("Account not found.");
    }

    if (account.status !== "ACTIVE") {
      throw new BadRequestError(
        "Account must be active.",
      );
    }

    // ====================================================
    // MERCHANT
    // ====================================================

    const merchant =
      await this.paymentsRepository.findMerchantById(
        data.merchantId,
      );

    if (!merchant) {
      throw new NotFoundError("Merchant not found.");
    }

    if (merchant.status !== "ACTIVE") {
      throw new BadRequestError(
        "Merchant must be active.",
      );
    }

    if (merchant.accountId === account.id) {
      throw new BadRequestError(
        "You cannot pay yourself.",
      );
    }

    // ====================================================
    // SOURCE WALLET
    // ====================================================

    const sourceWallet =
      await this.findWalletForPayment(
        account.id,
        data.amount,
      );

    // ====================================================
    // DESTINATION WALLET
    // ====================================================

    const destinationWallet =
      await this.paymentsRepository.findWalletByAccountAndCurrency(
        merchant.accountId,
        sourceWallet.currencyId,
      );

    if (!destinationWallet) {
      throw new BadRequestError(
        "Merchant does not have a wallet in the payment currency.",
      );
    }

    if (destinationWallet.status !== "ACTIVE") {
      throw new BadRequestError(
        "Merchant wallet must be active.",
      );
    }

    // ====================================================
    // EXECUTE PAYMENT
    // ====================================================

    try {
      return await this.paymentsRepository.pay({
        paymentNumber: generatePaymentNumber(),

        accountId: account.id,
        merchantId: merchant.id,

        sourceWalletId: sourceWallet.id,
        destinationWalletId: destinationWallet.id,

        currencyId: sourceWallet.currencyId,

        amount: data.amount,

        idempotencyKey: data.idempotencyKey,

        description: data.description,
        externalReference: data.externalReference,

        transactionNumber:
          generateTransactionNumber(),

        sourceLedgerNumber:
          generateLedgerEntryNumber(),

        destinationLedgerNumber:
          generateLedgerEntryNumber(),
      });
    } catch (error) {
      // ==================================================
      // CONCURRENT IDEMPOTENCY REQUEST
      // ==================================================

      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        const payment =
          await this.paymentsRepository.findByIdempotencyKey(
            data.idempotencyKey,
          );

        if (payment) {
          if (payment.accountId !== data.accountId) {
            throw new ConflictError(
              "Idempotency key has already been used by another account.",
            );
          }

          return payment;
        }
      }

      throw error;
    }
  }

  // ======================================================
  // REFUND PAYMENT
  // ======================================================

  async refund(
    userId: string,
    paymentId: string,
    data: RefundPaymentDTO,
  ) {
    // ====================================================
    // PROFILE
    // ====================================================

    const profile =
      await this.paymentsRepository.findProfileByUserId(
        userId,
      );

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    // ====================================================
    // IDEMPOTENCY
    // ====================================================

    const existingRefund =
      await this.paymentsRepository.findByIdempotencyKey(
        data.idempotencyKey,
      );

    if (existingRefund) {
      return existingRefund;
    }

    // ====================================================
    // PAYMENT
    // ====================================================

    const payment =
      await this.paymentsRepository.findPaymentForRefund(
        paymentId,
      );

    if (!payment) {
      throw new NotFoundError(
        "Payment not found.",
      );
    }

    // ====================================================
    // PAYMENT OWNERSHIP
    // ====================================================

    const account =
      await this.paymentsRepository.findAccountById(
        payment.accountId,
      );

    if (!account || account.profileId !== profile.id) {
      throw new NotFoundError(
        "Payment not found.",
      );
    }

    // ====================================================
    // PAYMENT STATUS
    // ====================================================

    if (payment.status === "REFUNDED") {
      throw new ConflictError(
        "Payment has already been refunded.",
      );
    }

    if (payment.status !== "COMPLETED") {
      throw new BadRequestError(
        "Only completed payments can be refunded.",
      );
    }

    // ====================================================
    // ORIGINAL TRANSACTION
    // ====================================================

    if (!payment.transaction) {
      throw new BadRequestError(
        "Payment transaction not found.",
      );
    }

    if (payment.transaction.status !== "COMPLETED") {
      throw new BadRequestError(
        "Payment transaction must be completed.",
      );
    }

    if (
      !payment.transaction.sourceWalletId ||
      !payment.transaction.destinationWalletId
    ) {
      throw new BadRequestError(
        "Payment wallets could not be determined.",
      );
    }

    // ====================================================
    // MERCHANT
    // ====================================================

    if (!payment.merchantId) {
      throw new BadRequestError(
        "Payment merchant not found.",
      );
    }

    const merchant =
      await this.paymentsRepository.findMerchantById(
        payment.merchantId,
      );

    if (!merchant) {
      throw new NotFoundError(
        "Merchant not found.",
      );
    }

    if (merchant.status !== "ACTIVE") {
      throw new BadRequestError(
        "Merchant must be active.",
      );
    }

    // ====================================================
    // REFUND WALLETS
    // ====================================================

    /*
     * Original payment:
     *
     * Customer wallet
     *       ↓
     * Merchant wallet
     *
     * Refund:
     *
     * Merchant wallet
     *       ↓
     * Customer wallet
     */

    const merchantWallet =
      await this.paymentsRepository.findWalletByAccountAndCurrency(
        merchant.accountId,
        payment.transaction.currencyId,
      );

    if (!merchantWallet) {
      throw new BadRequestError(
        "Merchant wallet not found.",
      );
    }

    if (merchantWallet.status !== "ACTIVE") {
      throw new BadRequestError(
        "Merchant wallet must be active.",
      );
    }

    const customerWallet =
      await this.paymentsRepository.findWalletByAccountAndCurrency(
        payment.accountId,
        payment.transaction.currencyId,
      );

    if (!customerWallet) {
      throw new BadRequestError(
        "Customer wallet not found.",
      );
    }

    if (customerWallet.status !== "ACTIVE") {
      throw new BadRequestError(
        "Customer wallet must be active.",
      );
    }

    // ====================================================
    // EXECUTE REFUND
    // ====================================================

    try {
      return await this.paymentsRepository.refund({
        paymentId: payment.id,

        idempotencyKey:
          data.idempotencyKey,

        transactionNumber:
          generateTransactionNumber(),

        sourceWalletId:
          merchantWallet.id,

        destinationWalletId:
          customerWallet.id,

        currencyId:
          payment.transaction.currencyId,

        amount:
          payment.amount.toString(),

        description:
          data.description,

        sourceLedgerNumber:
          generateLedgerEntryNumber(),

        destinationLedgerNumber:
          generateLedgerEntryNumber(),
      });
    } catch (error) {
      // ==================================================
      // CONCURRENT REFUND IDEMPOTENCY
      // ==================================================

      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        const existingRefund =
          await this.paymentsRepository.findByIdempotencyKey(
            data.idempotencyKey,
          );

        if (existingRefund) {
          return existingRefund;
        }
      }

      // ==================================================
      // PAYMENT ALREADY REFUNDED
      // ==================================================

      if (
        error instanceof Error &&
        error.message ===
          "PAYMENT_ALREADY_REFUNDED"
      ) {
        throw new ConflictError(
          "Payment has already been refunded.",
        );
      }

      // ==================================================
      // MERCHANT BALANCE
      // ==================================================

      if (
        error instanceof Error &&
        error.message ===
          "MERCHANT_INSUFFICIENT_BALANCE"
      ) {
        throw new BadRequestError(
          "Merchant has insufficient balance for this refund.",
        );
      }

      // ==================================================
      // CUSTOMER WALLET
      // ==================================================

      if (
        error instanceof Error &&
        error.message ===
          "CUSTOMER_WALLET_UNAVAILABLE"
      ) {
        throw new BadRequestError(
          "Customer wallet is unavailable.",
        );
      }

      throw error;
    }
  }

  // ======================================================
  // FIND WALLET WITH SUFFICIENT BALANCE
  // ======================================================

  private async findWalletForPayment(
    accountId: string,
    amount: string,
  ) {
    const accountWallets =
      await this.getAccountWallets(accountId);

    const activeWallet =
      accountWallets.find(
        (wallet) =>
          wallet.status === "ACTIVE" &&
          Number(wallet.availableBalance) >=
            Number(amount),
      );

    if (!activeWallet) {
      throw new BadRequestError(
        "Insufficient wallet balance.",
      );
    }

    return activeWallet;
  }

  // ======================================================
  // GET ACCOUNT WALLETS
  // ======================================================

  private async getAccountWallets(
    accountId: string,
  ) {
    return this.paymentsRepository.findWalletsByAccountId(
      accountId,
    );
  }

  // ======================================================
  // LIST PAYMENTS
  // ======================================================

  async findAll(userId: string) {
    const profile =
      await this.paymentsRepository.findProfileByUserId(
        userId,
      );

    if (!profile) {
      throw new NotFoundError(
        "Profile not found.",
      );
    }

    /*
     * The repository already knows how to find
     * all payments belonging to accounts owned
     * by this profile.
     *
     * No need to:
     *
     * 1. Find all accounts.
     * 2. Loop through every account.
     * 3. Query payments for each account.
     */

    return this.paymentsRepository.findPaymentsByProfileId(
      profile.id,
    );
  }

  // ======================================================
  // FIND PAYMENT
  // ======================================================

  async findById(
    userId: string,
    paymentId: string,
  ) {
    const profile =
      await this.paymentsRepository.findProfileByUserId(
        userId,
      );

    if (!profile) {
      throw new NotFoundError(
        "Profile not found.",
      );
    }

    const payment =
      await this.paymentsRepository.findPaymentById(
        paymentId,
      );

    if (!payment) {
      throw new NotFoundError(
        "Payment not found.",
      );
    }

    // ====================================================
    // PAYMENT OWNERSHIP
    // ====================================================

    const account =
      await this.paymentsRepository.findAccountById(
        payment.accountId,
      );

    if (!account || account.profileId !== profile.id) {
      throw new NotFoundError(
        "Payment not found.",
      );
    }

    return payment;
  }
}