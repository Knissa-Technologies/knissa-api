import { AppError } from "../../../shared/errors/AppError.js";

import { CurrencyRepository } from "../repositories/CurrencyRepository.js";

export class GetCurrencyService {
  constructor(
    private readonly repository = new CurrencyRepository()
  ) {}

  async execute(code: string) {
    const currency = await this.repository.findByCode(code);

    if (!currency) {
      throw new AppError("Currency not found.", 404);
    }

    return currency;
  }
}