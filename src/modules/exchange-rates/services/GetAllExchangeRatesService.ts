import { ExchangeRateRepository } from "../repositories/ExchangeRateRepository.js";

export class GetAllExchangeRatesService {
  private exchangeRateRepository: ExchangeRateRepository;

  constructor() {
    this.exchangeRateRepository = new ExchangeRateRepository();
  }

  async execute() {
    return await this.exchangeRateRepository.findAll();
  }
}