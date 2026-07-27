import { AppError } from "../../../shared/errors/AppError.js";

import { WalletRepository } from "../repositories/WalletRepository.js";
import { CountryRepository } from "../../countries/repositories/CountryRepository.js";
import { CurrencyRepository } from "../../currencies/repositories/CurrencyRepository.js";

import { generateAccountNumber } from "../../../shared/utils/generateAccountNumber.js";

export class OpenAccountService {
  constructor(
    private readonly walletRepository = new WalletRepository(),
    private readonly countryRepository = new CountryRepository(),
    private readonly currencyRepository = new CurrencyRepository(),
  ) {}

  async execute(userId: string, countryId: string) {
    // Busca o país
    const country = await this.countryRepository.findById(countryId);

    if (!country) {
      throw new AppError("Country not found.", 404);
    }

    if (!country.currencyCode) {
      throw new AppError("Country has no default currency.", 400);
    }

    // Busca a moeda do país
    const currency = await this.currencyRepository.findByCode(
      country.currencyCode,
    );

    if (!currency) {
      throw new AppError("Currency not found.", 404);
    }

    // Verifica se o usuário já possui uma carteira nesta moeda
    const walletExists = await this.walletRepository.findByUserAndCurrency(
      userId,
      currency.id,
    );

    if (walletExists) {
      throw new AppError(`User already has a ${currency.code} wallet.`, 409);
    }

    // Gera um número de conta único
    let accountNumber = generateAccountNumber();

    while (await this.walletRepository.findByAccountNumber(accountNumber)) {
      accountNumber = generateAccountNumber();
    }

    // Cria a carteira
    const wallet = await this.walletRepository.create({
      userId,
      currencyId: currency.id,
      accountNumber,
    });

    return wallet;
  }
}
