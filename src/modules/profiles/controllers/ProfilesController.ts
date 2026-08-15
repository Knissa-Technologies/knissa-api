import type { Request, Response } from "express";

import { ApiResponse } from "../../../shared/http/ApiResponse.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

import { ProfilesService } from "../services/ProfilesService.js";

import { updateProfileSchema } from "../validators/update-profile.validator.js";

export class ProfilesController {
  private profilesService = new ProfilesService();

  async findMe(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError("User authentication required.");
    }

    const profile = await this.profilesService.findMyProfile(
      req.user.id,
    );

    return res.json(ApiResponse.success(profile));
  }

  async updateMe(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError("User authentication required.");
    }

    const data = updateProfileSchema.parse(req.body);

    const profile =
      await this.profilesService.updateMyProfile(
        req.user.id,
        data,
      );

    return res.json(
      ApiResponse.success(
        profile,
        "Profile updated successfully.",
      ),
    );
  }
}