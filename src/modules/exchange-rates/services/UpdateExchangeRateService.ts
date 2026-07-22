import { ExchangeRateRepository } from "../repositories/ExchangeRateRepository.js";
import { UpdateExchangeRateDTO } from "../dto/UpdateExchangeRateDTO.js";

export class UpdateExchangeRateService {
  private exchangeRateRepository = new ExchangeRateRepository();

  async execute(id: string, data: UpdateExchangeRateDTO) {
    const exchangeRate = await this.exchangeRateRepository.findById(id);

    if (!exchangeRate) {
      throw new Error("Exchange rate not found.");
    }

    return await this.exchangeRateRepository.update(id, data);
  }
}