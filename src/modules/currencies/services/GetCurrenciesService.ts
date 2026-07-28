import { CurrencyRepository } from "../repositories/CurrencyRepository.js";

export class GetCurrenciesService {
  constructor(private readonly repository = new CurrencyRepository()) {}

  async execute() {
    return this.repository.findAll();
  }
}