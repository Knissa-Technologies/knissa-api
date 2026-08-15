import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

import type { UpdateProfileDTO } from "../dtos/UpdateProfileDTO.js";

import { ProfilesRepository } from "../repositories/ProfilesRepository.js";

import { ProfileMapper } from "../mappers/ProfileMapper.js";

export class ProfilesService {
  private profilesRepository = new ProfilesRepository();

  async findMyProfile(userId: string) {
    const profile =
      await this.profilesRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    return ProfileMapper.toResponse(profile);
  }

  async updateMyProfile(
    userId: string,
    data: UpdateProfileDTO,
  ) {
    const profile =
      await this.profilesRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found.");
    }

    const updatedProfile =
      await this.profilesRepository.update(
        profile.id,
        data,
      );

    return ProfileMapper.toResponse(updatedProfile);
  }
}