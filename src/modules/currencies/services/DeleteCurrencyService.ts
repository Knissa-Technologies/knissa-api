import { AppError } from "../../../shared/errors/AppError.js";
import { CurrencyRepository } from "../repositories/CurrencyRepository.js";

export class DeleteCurrencyService {
  constructor(private readonly repository = new CurrencyRepository()) {}

  async execute(id: string) {
    const currency = await this.repository.findById(id);

    if (!currency) {
      throw new AppError("Currency not found.", 404);
    }

    await this.repository.delete(id);
  }
}