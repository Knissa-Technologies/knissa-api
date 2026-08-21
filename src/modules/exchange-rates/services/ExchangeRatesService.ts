import { ExchangeRateProvider } from "@prisma/client";

import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

import type { CreateExchangeRateDTO } from "../dtos/CreateExchangeRateDTO.js";
import type { UpdateExchangeRateDTO } from "../dtos/UpdateExchangeRateDTO.js";

import { ExchangeRatesRepository } from "../repositories/ExchangeRatesRepository.js";

export class ExchangeRatesService {
  private exchangeRatesRepository = new ExchangeRatesRepository();

  // ======================================================
  // FIND ALL EXCHANGE RATES
  // ======================================================

  async findAll() {
    return this.exchangeRatesRepository.findAll();
  }

  // ======================================================
  // FIND EXCHANGE RATE BY ID
  // ======================================================

  async findById(rateId: string) {
    const exchangeRate = await this.exchangeRatesRepository.findById(rateId);

    if (!exchangeRate) {
      throw new NotFoundError("Exchange rate not found.");
    }

    return exchangeRate;
  }

  // ======================================================
  // CREATE EXCHANGE RATE
  // ======================================================

  async create(data: CreateExchangeRateDTO) {
    // ====================================================
    // BASE CURRENCY
    // ====================================================

    const baseCurrency = await this.exchangeRatesRepository.findCurrencyById(
      data.baseCurrencyId,
    );

    if (!baseCurrency) {
      throw new NotFoundError("Base currency not found.");
    }

    if (!baseCurrency.isActive) {
      throw new BadRequestError("Base currency must be active.");
    }

    // ====================================================
    // QUOTE CURRENCY
    // ====================================================

    const quoteCurrency = await this.exchangeRatesRepository.findCurrencyById(
      data.quoteCurrencyId,
    );

    if (!quoteCurrency) {
      throw new NotFoundError("Quote currency not found.");
    }

    if (!quoteCurrency.isActive) {
      throw new BadRequestError("Quote currency must be active.");
    }

    // ====================================================
    // VALIDATE CURRENCIES
    // ====================================================

    if (baseCurrency.id === quoteCurrency.id) {
      throw new BadRequestError("Base and quote currencies must be different.");
    }

    // ====================================================
    // VALIDATE RATE
    // ====================================================

    const rate = Number(data.rate);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new BadRequestError("Exchange rate must be greater than zero.");
    }

    // ====================================================
    // PROVIDER
    // ====================================================

    const provider = data.provider
      ? (data.provider as ExchangeRateProvider)
      : ExchangeRateProvider.MANUAL;

    if (!Object.values(ExchangeRateProvider).includes(provider)) {
      throw new BadRequestError("Invalid exchange rate provider.");
    }

    // ====================================================
    // VALID FROM
    // ====================================================

    const validFrom = data.validFrom ? new Date(data.validFrom) : new Date();

    if (Number.isNaN(validFrom.getTime())) {
      throw new BadRequestError("Invalid validFrom date.");
    }

    // ====================================================
    // VALID UNTIL
    // ====================================================

    const validUntil = data.validUntil ? new Date(data.validUntil) : null;

    if (validUntil && Number.isNaN(validUntil.getTime())) {
      throw new BadRequestError("Invalid validUntil date.");
    }

    if (validUntil && validUntil <= validFrom) {
      throw new BadRequestError("validUntil must be later than validFrom.");
    }

    // ====================================================
    // GENERATE RATE NUMBER
    // ====================================================

    const rateNumber = `RATE-${baseCurrency.code}-${quoteCurrency.code}-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 8)
      .toUpperCase()}`;

    // ====================================================
    // EXPIRE PREVIOUS ACTIVE RATES
    // ====================================================

    await this.exchangeRatesRepository.expireActiveRates(
      baseCurrency.id,
      quoteCurrency.id,
    );

    // ====================================================
    // CREATE NEW EXCHANGE RATE
    // ====================================================

    return this.exchangeRatesRepository.create({
      rateNumber,

      baseCurrencyId: baseCurrency.id,
      quoteCurrencyId: quoteCurrency.id,

      rate: rate.toFixed(8),

      provider,

      validFrom,
      validUntil,
    });
  }

  // ======================================================
  // UPDATE EXCHANGE RATE
  // ======================================================

  async update(rateId: string, data: UpdateExchangeRateDTO) {
    const exchangeRate = await this.exchangeRatesRepository.findById(rateId);

    if (!exchangeRate) {
      throw new NotFoundError("Exchange rate not found.");
    }

    // ====================================================
    // RATE
    // ====================================================

    let rate: string | undefined;

    if (data.rate !== undefined) {
      const numericRate = Number(data.rate);

      if (!Number.isFinite(numericRate) || numericRate <= 0) {
        throw new BadRequestError("Exchange rate must be greater than zero.");
      }

      rate = numericRate.toFixed(8);
    }

    // ====================================================
    // PROVIDER
    // ====================================================

    let provider: ExchangeRateProvider | undefined;

    if (data.provider !== undefined) {
      provider = data.provider as ExchangeRateProvider;

      if (!Object.values(ExchangeRateProvider).includes(provider)) {
        throw new BadRequestError("Invalid exchange rate provider.");
      }
    }

    // ====================================================
    // VALID FROM
    // ====================================================

    let validFrom: Date | undefined;

    if (data.validFrom !== undefined) {
      validFrom = new Date(data.validFrom);

      if (Number.isNaN(validFrom.getTime())) {
        throw new BadRequestError("Invalid validFrom date.");
      }
    }

    // ====================================================
    // VALID UNTIL
    // ====================================================

    let validUntil: Date | null | undefined;

    if (data.validUntil !== undefined) {
      validUntil = data.validUntil ? new Date(data.validUntil) : null;

      if (validUntil && Number.isNaN(validUntil.getTime())) {
        throw new BadRequestError("Invalid validUntil date.");
      }
    }

    // ====================================================
    // DATE VALIDATION
    // ====================================================

    const finalValidFrom = validFrom ?? exchangeRate.validFrom;

    const finalValidUntil =
      validUntil !== undefined ? validUntil : exchangeRate.validUntil;

    if (finalValidUntil && finalValidUntil <= finalValidFrom) {
      throw new BadRequestError("validUntil must be later than validFrom.");
    }

    // ====================================================
    // UPDATE
    // ====================================================

    return this.exchangeRatesRepository.update(rateId, {
      rate,
      provider,
      validFrom,
      validUntil,
    });
  }

  // ======================================================
  // EXPIRE EXCHANGE RATE
  // ======================================================

  async expire(rateId: string) {
    const exchangeRate = await this.exchangeRatesRepository.findById(rateId);

    if (!exchangeRate) {
      throw new NotFoundError("Exchange rate not found.");
    }

    const now = new Date();

    if (exchangeRate.validUntil && exchangeRate.validUntil <= now) {
      throw new BadRequestError("Exchange rate is already expired.");
    }

    return this.exchangeRatesRepository.expire(rateId);
  }
}
