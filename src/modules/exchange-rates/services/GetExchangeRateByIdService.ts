import { ExchangeRateRepository } from "../repositories/ExchangeRateRepository.js";

export class GetExchangeRateByIdService {
  private exchangeRateRepository: ExchangeRateRepository;

  constructor() {
    this.exchangeRateRepository = new ExchangeRateRepository();
  }

  async execute(id: string) {
    const exchangeRate =
      await this.exchangeRateRepository.findById(id);

    if (!exchangeRate) {
      throw new Error("Exchange rate not found.");
    }

    return exchangeRate;
  }
}