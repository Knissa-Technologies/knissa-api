import { ConflictError } from "../../../shared/errors/ConflictError.js";

import { PaymentsService } from "../../payments/services/PaymentsService.js";
import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

import type { CreatePaymentLinkDTO } from "../dtos/CreatePaymentLinkDTO.js";

import { PaymentLinksRepository } from "../repositories/PaymentLinksRepository.js";

import { generatePaymentLinkNumber } from "../../../shared/utils/generatePaymentLinkNumber.js";

export class PaymentLinksService {
  private paymentLinksRepository = new PaymentLinksRepository();

  private paymentsService = new PaymentsService();

  // ======================================================
  // CREATE PAYMENT LINK
  // ======================================================

  async create(userId: string, data: CreatePaymentLinkDTO) {
    const profile =
      await this.paymentLinksRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    const merchant = await this.paymentLinksRepository.findMerchantById(
      data.merchantId,
    );

    if (!merchant) {
      throw new NotFoundError("Merchant not found.");
    }

    const merchantAccount = await this.paymentLinksRepository.findAccountById(
      merchant.accountId,
    );

    if (!merchantAccount || merchantAccount.profileId !== profile.id) {
      throw new NotFoundError("Merchant not found.");
    }

    if (merchant.status !== "ACTIVE") {
      throw new BadRequestError("Merchant must be active.");
    }

    if (merchant.settings && !merchant.settings.allowPaymentLinks) {
      throw new BadRequestError(
        "Payment links are disabled for this merchant.",
      );
    }

    const amount = Number(data.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestError("Amount must be greater than zero.");
    }

    if (
      data.maxUses !== undefined &&
      (!Number.isInteger(data.maxUses) || data.maxUses <= 0)
    ) {
      throw new BadRequestError("maxUses must be a positive integer.");
    }

    let expiresAt: Date | undefined;

    if (data.expiresAt) {
      expiresAt = new Date(data.expiresAt);

      if (Number.isNaN(expiresAt.getTime())) {
        throw new BadRequestError("Invalid expiration date.");
      }

      if (expiresAt <= new Date()) {
        throw new BadRequestError("Expiration date must be in the future.");
      }
    }

    const currency = await this.paymentLinksRepository.findCurrencyById(
      data.currencyId,
    );

    if (!currency) {
      throw new NotFoundError("Currency not found.");
    }

    if (!currency.isActive) {
      throw new BadRequestError("Currency must be active.");
    }

    return this.paymentLinksRepository.create({
      paymentLinkNumber: generatePaymentLinkNumber(),

      merchantId: merchant.id,
      currencyId: currency.id,

      amount: data.amount,

      description: data.description,
      externalReference: data.externalReference,

      expiresAt,

      maxUses: data.maxUses,
    });
  }

  // ======================================================
  // LIST PAYMENT LINKS
  // ======================================================

  async findAll(userId: string) {
    const profile =
      await this.paymentLinksRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    const account = await this.paymentLinksRepository.findAccountByProfileId(
      profile.id,
    );

    if (!account) {
      throw new NotFoundError("Account not found.");
    }

    const merchant = await this.paymentLinksRepository.findMerchantByAccountId(
      account.id,
    );

    if (!merchant) {
      throw new NotFoundError("Merchant not found.");
    }

    return this.paymentLinksRepository.findByMerchantId(merchant.id);
  }

  // ======================================================
  // FIND PAYMENT LINK BY ID
  // ======================================================

  async findById(userId: string, paymentLinkId: string) {
    const profile =
      await this.paymentLinksRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    const account = await this.paymentLinksRepository.findAccountByProfileId(
      profile.id,
    );

    if (!account) {
      throw new NotFoundError("Account not found.");
    }

    const merchant = await this.paymentLinksRepository.findMerchantByAccountId(
      account.id,
    );

    if (!merchant) {
      throw new NotFoundError("Merchant not found.");
    }

    const paymentLink =
      await this.paymentLinksRepository.findById(paymentLinkId);

    if (!paymentLink) {
      throw new NotFoundError("Payment link not found.");
    }

    // Segurança: o link precisa pertencer ao merchant
    // do usuário autenticado.
    if (paymentLink.merchantId !== merchant.id) {
      throw new NotFoundError("Payment link not found.");
    }

    return paymentLink;
  }

  // ======================================================
  // CANCEL PAYMENT LINK
  // ======================================================

  async cancel(userId: string, paymentLinkId: string) {
    const profile =
      await this.paymentLinksRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    const account = await this.paymentLinksRepository.findAccountByProfileId(
      profile.id,
    );

    if (!account) {
      throw new NotFoundError("Account not found.");
    }

    const merchant = await this.paymentLinksRepository.findMerchantByAccountId(
      account.id,
    );

    if (!merchant) {
      throw new NotFoundError("Merchant not found.");
    }

    const paymentLink =
      await this.paymentLinksRepository.findById(paymentLinkId);

    if (!paymentLink) {
      throw new NotFoundError("Payment link not found.");
    }

    // Segurança: o link precisa pertencer ao merchant
    // do usuário autenticado.
    if (paymentLink.merchantId !== merchant.id) {
      throw new NotFoundError("Payment link not found.");
    }

    if (paymentLink.status !== "ACTIVE") {
      throw new BadRequestError("Only active payment links can be cancelled.");
    }

    return this.paymentLinksRepository.cancel(paymentLinkId);
  }

  // ======================================================
  // PAY PAYMENT LINK
  // ======================================================

  async pay(
    userId: string,
    paymentLinkId: string,
    data: {
      accountId: string;
      idempotencyKey: string;
      description?: string;
    },
  ) {
    // ====================================================
    // PAYMENT LINK
    // ====================================================

    const paymentLink =
      await this.paymentLinksRepository.findById(paymentLinkId);

    if (!paymentLink) {
      throw new NotFoundError("Payment link not found.");
    }

    // ====================================================
    // PAYMENT LINK STATUS
    // ====================================================

    if (paymentLink.status === "CANCELLED") {
      throw new BadRequestError("Payment link has been cancelled.");
    }

    if (paymentLink.status === "EXPIRED") {
      throw new BadRequestError("Payment link has expired.");
    }

    if (paymentLink.status === "PAID") {
      throw new BadRequestError("Payment link has already been paid.");
    }

    if (paymentLink.status !== "ACTIVE") {
      throw new BadRequestError("Payment link is not active.");
    }

    // ====================================================
    // EXPIRATION
    // ====================================================

    if (paymentLink.expiresAt && paymentLink.expiresAt <= new Date()) {
      throw new BadRequestError("Payment link has expired.");
    }

    // ====================================================
    // MAXIMUM USES
    // ====================================================

    if (
      paymentLink.maxUses !== null &&
      paymentLink.usedCount >= paymentLink.maxUses
    ) {
      throw new BadRequestError(
        "Payment link has reached its maximum number of uses.",
      );
    }

    // ====================================================
    // IDEMPOTENCY / PAYMENT
    // ====================================================

    try {
      const payment = await this.paymentsService.create(userId, {
        accountId: data.accountId,

        merchantId: paymentLink.merchantId,

        type: "PURCHASE",

        method: "WALLET",

        amount: paymentLink.amount.toString(),

        idempotencyKey: data.idempotencyKey,

        description:
          data.description ??
          paymentLink.description ??
          `Payment via link ${paymentLink.paymentLinkNumber}`,

        externalReference: paymentLink.externalReference ?? undefined,
      });

      // ==================================================
      // REGISTER PAYMENT LINK USAGE
      // ==================================================

      await this.paymentLinksRepository.registerPayment(
        paymentLink.id,
        payment.id,
      );

      return payment;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }

      throw error;
    }
  }

  // ======================================================
  // MERCHANT ACCOUNT
  // ======================================================

  private async getMerchantAccount(accountId: string) {
    return this.paymentLinksRepository.findAccountById(accountId);
  }
}
