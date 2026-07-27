import { prisma } from "../../../infra/database/prisma.js";
import { ExchangeRateRepository } from "../repositories/ExchangeRateRepository.js";
import { CreateExchangeRateDTO } from "../dto/CreateExchangeRateDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class CreateExchangeRateService {
  private exchangeRateRepository: ExchangeRateRepository;

  constructor() {
    this.exchangeRateRepository = new ExchangeRateRepository();
  }

  async execute(data: CreateExchangeRateDTO) {
    const { baseCurrencyId, quoteCurrencyId, rate, source } = data;

    // Não permite converter uma moeda para ela mesma
    if (baseCurrencyId === quoteCurrencyId) {
      throw new AppError(
        "Base currency and quote currency cannot be the same.",
        400,
      );
    }

    // Verifica se a moeda base existe
    const baseCurrency = await prisma.currency.findUnique({
      where: {
        id: baseCurrencyId,
      },
    });

    if (!baseCurrency) {
      throw new AppError("Base currency not found.", 404);
    }

    // Verifica se a moeda de destino existe
    const quoteCurrency = await prisma.currency.findUnique({
      where: {
        id: quoteCurrencyId,
      },
    });

    if (!quoteCurrency) {
      throw new AppError("Quote currency not found.", 404);
    }

    // Verifica se a taxa já existe
    const existingRate = await this.exchangeRateRepository.findByCurrencies(
      baseCurrencyId,
      quoteCurrencyId,
    );

    if (existingRate) {
      throw new AppError(
        "Exchange rate already exists for these currencies.",
        409,
      );
    }

    // Cria a taxa de câmbio
    return await this.exchangeRateRepository.create({
      baseCurrencyId,
      quoteCurrencyId,
      rate,
      source,
    });
  }
}
