import { AppError } from "../../../shared/errors/AppError.js";

import { TransactionRepository } from "../repositories/TransactionRepository.js";

export class GetTransactionByReferenceService {
  constructor(
    private readonly repository = new TransactionRepository(),
  ) {}

  async execute(reference: string) {
    const transaction =
      await this.repository.findByReferenceWithRelations(reference);

    if (!transaction) {
      throw new AppError("Transaction not found.", 404);
    }

    return transaction;
  }
}