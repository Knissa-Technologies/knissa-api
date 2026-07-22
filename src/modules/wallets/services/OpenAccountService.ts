import { AppError } from "../../../shared/errors/AppError.js";

import { WalletRepository } from "../repositories/WalletRepository.js";
import { CountryRepository } from "../../countries/repositories/CountryRepository.js";
import { CurrencyRepository } from "../../currencies/repositories/CurrencyRepository.js";

import { generateAccountNumber } from "../../../shared/utils/generateAccountNumber.js";

export class OpenAccountService {
  constructor(
    private readonly walletRepository = new WalletRepository(),
    private readonly countryRepository = new CountryRepository(),
    private readonly currencyRepository = new CurrencyRepository()
  ) {}

  async execute(userId: string, countryId: string) {
    console.log("🚀 OpenAccountService foi chamado");
    console.log("==================================");
    console.log("🚀 OPEN ACCOUNT SERVICE");
    console.log("User ID:", userId);
    console.log("Country ID:", countryId);

    // Verifica se já existe uma carteira
    const walletExists = await this.walletRepository.findByUserId(userId);

    console.log("Wallet existente:", walletExists);

    if (walletExists) {
      throw new AppError("Wallet already exists.", 409);
    }

    // Busca o país
    const country = await this.countryRepository.findById(countryId);

    console.log("Country encontrado:", country);

    if (!country) {
      throw new AppError("Country not found.", 404);
    }

    if (!country.currencyCode) {
      throw new AppError("Country has no default currency.", 400);
    }

    // Busca a moeda
    const currency = await this.currencyRepository.findByCode(
      country.currencyCode
    );

    console.log("Currency encontrada:", currency);

    if (!currency) {
      throw new AppError("Currency not found.", 404);
    }

    // Gera número da conta
    let accountNumber = generateAccountNumber();

    while (
      await this.walletRepository.findByAccountNumber(accountNumber)
    ) {
      accountNumber = generateAccountNumber();
    }

    console.log("Account Number:", accountNumber);

    // Cria a Wallet
    const wallet = await this.walletRepository.create({
      userId,
      currencyId: currency.id,
      accountNumber,
    });

    console.log("✅ Wallet criada com sucesso!");
    console.log(wallet);
    console.log("==================================");

    return wallet;
  }
}