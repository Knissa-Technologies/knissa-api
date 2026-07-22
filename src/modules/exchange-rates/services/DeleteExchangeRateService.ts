import { ExchangeRateRepository } from "../repositories/ExchangeRateRepository.js";

export class DeleteExchangeRateService {
  private exchangeRateRepository = new ExchangeRateRepository();

  async execute(id: string) {
    const exchangeRate = await this.exchangeRateRepository.findById(id);

    if (!exchangeRate) {
      throw new Error("Exchange rate not found.");
    }

    await this.exchangeRateRepository.delete(id);
  }
}