import { AppError } from "../../../shared/errors/AppError.js";

import { CreateWalletDTO } from "../dto/CreateWalletDTO.js";
import { WalletRepository } from "../repositories/WalletRepository.js";

import { generateAccountNumber } from "../../../shared/utils/generateAccountNumber.js";

export class CreateWalletService {
  constructor(
    private readonly walletRepository = new WalletRepository()
  ) {}

  async execute(data: CreateWalletDTO) {
    const walletAlreadyExists =
      await this.walletRepository.findByUserId(data.userId);

    if (walletAlreadyExists) {
      throw new AppError("Wallet already exists.", 409);
    }

    let accountNumber = generateAccountNumber();

    while (
      await this.walletRepository.findByAccountNumber(accountNumber)
    ) {
      accountNumber = generateAccountNumber();
    }

    return this.walletRepository.create({
      userId: data.userId,
      currencyId: data.currencyId,
      accountNumber,
    });
  }
}