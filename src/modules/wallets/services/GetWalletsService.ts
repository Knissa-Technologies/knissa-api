import { WalletRepository } from "../repositories/WalletRepository.js";

export class GetWalletsService {
  private readonly repository = new WalletRepository();

  async execute(userId: string) {
    return this.repository.findByUserId(userId);
  }
}