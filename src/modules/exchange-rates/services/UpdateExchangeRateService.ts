import { ExchangeRateRepository } from "../repositories/ExchangeRateRepository.js";
import { UpdateExchangeRateDTO } from "../dto/UpdateExchangeRateDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class UpdateExchangeRateService {
  private exchangeRateRepository = new ExchangeRateRepository();

  async execute(id: string, data: UpdateExchangeRateDTO) {
    const exchangeRate = await this.exchangeRateRepository.findById(id);

    if (!exchangeRate) {
      throw new AppError("Exchange rate not found.", 404);
    }

    return await this.exchangeRateRepository.update(id, data);
  }
}
