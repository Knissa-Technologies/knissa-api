import { ExchangeRateRepository } from "../repositories/ExchangeRateRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class GetExchangeRateByIdService {
  private exchangeRateRepository: ExchangeRateRepository;

  constructor() {
    this.exchangeRateRepository = new ExchangeRateRepository();
  }

  async execute(id: string) {
    const exchangeRate = await this.exchangeRateRepository.findById(id);

    if (!exchangeRate) {
      throw new AppError("Exchange rate not found.", 404);
    }

    return exchangeRate;
  }
}
