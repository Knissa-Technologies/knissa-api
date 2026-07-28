import { AppError } from "../../../shared/errors/AppError.js";
import { CurrencyRepository } from "../repositories/CurrencyRepository.js";

interface UpdateCurrencyDTO {
  code?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  isActive?: boolean;
}

export class UpdateCurrencyService {
  constructor(private readonly repository = new CurrencyRepository()) {}

  async execute(id: string, data: UpdateCurrencyDTO) {
    const currency = await this.repository.findById(id);

    if (!currency) {
      throw new AppError("Currency not found.", 404);
    }

    if (data.code && data.code !== currency.code) {
      const exists = await this.repository.findByCode(data.code);

      if (exists) {
        throw new AppError("Currency already exists.", 409);
      }
    }

    return this.repository.update(id, data);
  }
}