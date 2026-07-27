import { ExchangeRateRepository } from "../repositories/ExchangeRateRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class DeleteExchangeRateService {
  private exchangeRateRepository = new ExchangeRateRepository();

  async execute(id: string) {
    const exchangeRate = await this.exchangeRateRepository.findById(id);

    if (!exchangeRate) {
      throw new AppError("Exchange rate not found.", 404);
    }

    await this.exchangeRateRepository.delete(id);
  }
}
