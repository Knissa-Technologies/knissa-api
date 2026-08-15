import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

import type { UpdateAccountDTO } from "../dtos/UpdateAccountDTO.js";

import { AccountsRepository } from "../repositories/AccountsRepository.js";

export class AccountsService {
  private accountsRepository = new AccountsRepository();

  private async getProfileId(userId: string) {
    const profile = await this.accountsRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    return profile.id;
  }

  async findAll(userId: string) {
    const profileId = await this.getProfileId(userId);

    return this.accountsRepository.findAllByProfileId(profileId);
  }

  async findById(userId: string, accountId: string) {
    const profileId = await this.getProfileId(userId);

    const account = await this.accountsRepository.findByIdAndProfileId(
      accountId,
      profileId,
    );

    if (!account) {
      throw new NotFoundError("Account not found.");
    }

    return account;
  }

  async update(userId: string, accountId: string, data: UpdateAccountDTO) {
    const profileId = await this.getProfileId(userId);

    const account = await this.accountsRepository.findByIdAndProfileId(
      accountId,
      profileId,
    );

    if (!account) {
      throw new NotFoundError("Account not found.");
    }

    return this.accountsRepository.update(account.id, data);
  }
}
