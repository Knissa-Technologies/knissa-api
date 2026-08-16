import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

import { generateRecipientNumber } from "../../../shared/utils/generateRecipientNumber.js";

import type { CreateRecipientDTO } from "../dtos/CreateRecipientDTO.js";
import type { UpdateRecipientDTO } from "../dtos/UpdateRecipientDTO.js";

import { RecipientsRepository } from "../repositories/RecipientsRepository.js";

export class RecipientsService {
  private recipientsRepository = new RecipientsRepository();

  private async getOwnerAccounts(userId: string) {
    const profile =
      await this.recipientsRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    const accounts =
      await this.recipientsRepository.findAccountsByProfileId(profile.id);

    if (accounts.length === 0) {
      throw new NotFoundError("Account not found.");
    }

    return accounts;
  }

  async findAll(userId: string) {
    const accounts = await this.getOwnerAccounts(userId);

    const accountIds = accounts.map((account) => account.id);

    return this.recipientsRepository.findAllByOwnerAccountIds(accountIds);
  }

  async findById(userId: string, recipientId: string) {
    const accounts = await this.getOwnerAccounts(userId);

    const accountIds = accounts.map((account) => account.id);

    const recipient =
      await this.recipientsRepository.findByIdAndOwnerAccountIds(
        recipientId,
        accountIds,
      );

    if (!recipient) {
      throw new NotFoundError("Recipient not found.");
    }

    return recipient;
  }

  async create(userId: string, data: CreateRecipientDTO) {
    const accounts = await this.getOwnerAccounts(userId);

    const ownerAccountNumber = data.ownerAccountNumber?.trim();
    const destinationAccountNumber = data.accountNumber?.trim();

    if (!ownerAccountNumber) {
      throw new BadRequestError("Owner account number is required.");
    }

    if (!destinationAccountNumber) {
      throw new BadRequestError("Destination account number is required.");
    }

    if (ownerAccountNumber === destinationAccountNumber) {
      throw new BadRequestError(
        "You cannot add your own account as a recipient.",
      );
    }

    const ownerAccount = accounts.find(
      (account) => account.accountNumber === ownerAccountNumber,
    );

    if (!ownerAccount) {
      throw new NotFoundError("Owner account not found.");
    }

    const destinationAccount =
      await this.recipientsRepository.findAccountByNumber(
        destinationAccountNumber,
      );

    if (!destinationAccount) {
      throw new NotFoundError("Destination account not found.");
    }

    if (destinationAccount.status !== "ACTIVE") {
      throw new BadRequestError("Destination account must be active.");
    }

    if (destinationAccount.id === ownerAccount.id) {
      throw new BadRequestError(
        "You cannot add your own account as a recipient.",
      );
    }

    const existingRecipient =
      await this.recipientsRepository.findByOwnerAndDestination(
        ownerAccount.id,
        destinationAccount.id,
      );

    if (existingRecipient) {
      throw new ConflictError("Recipient already exists.");
    }

    const displayName =
      destinationAccount.displayName.trim() || destinationAccountNumber;

    return this.recipientsRepository.create(
      ownerAccount.id,
      destinationAccount.id,
      {
        ...data,
        accountNumber: destinationAccountNumber,
        recipientNumber: generateRecipientNumber(),
        displayName,
      },
    );
  }

  async update(
    userId: string,
    recipientId: string,
    data: UpdateRecipientDTO,
  ) {
    const accounts = await this.getOwnerAccounts(userId);

    const accountIds = accounts.map((account) => account.id);

    const recipient =
      await this.recipientsRepository.findByIdAndOwnerAccountIds(
        recipientId,
        accountIds,
      );

    if (!recipient) {
      throw new NotFoundError("Recipient not found.");
    }

    if (data.status === "BLOCKED" && recipient.status === "BLOCKED") {
      throw new BadRequestError("Recipient is already blocked.");
    }

    if (data.status === "ACTIVE" && recipient.status === "ACTIVE") {
      throw new BadRequestError("Recipient is already active.");
    }

    return this.recipientsRepository.update(recipient.id, {
      nickname:
        data.nickname !== undefined
          ? data.nickname?.trim() || null
          : undefined,

      avatarUrl:
        data.avatarUrl !== undefined
          ? data.avatarUrl?.trim() || null
          : undefined,

      status: data.status,
    });
  }
}
