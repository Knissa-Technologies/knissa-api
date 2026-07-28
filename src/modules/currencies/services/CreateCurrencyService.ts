import { AppError } from "../../../shared/errors/AppError.js";
import { CurrencyRepository } from "../repositories/CurrencyRepository.js";

interface CreateCurrencyDTO {
  code: string;
  name: string;
  symbol: string;
  decimals?: number;
}

export class CreateCurrencyService {
  constructor(private readonly repository = new CurrencyRepository()) {}

  async execute(data: CreateCurrencyDTO) {
    const exists = await this.repository.findByCode(data.code);

    if (exists) {
      throw new AppError("Currency already exists.", 409);
    }

    return this.repository.create(data);
  }
}