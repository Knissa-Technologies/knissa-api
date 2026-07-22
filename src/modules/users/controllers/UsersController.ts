import { Request, Response } from "express";

import { CreateUserService } from "../services/CreateUserService.js";
import { GetProfileService } from "../services/GetProfileService.js";
import { GetUsersService } from "../services/GetUsersService.js";

export class UsersController {
  async create(req: Request, res: Response) {
    const service = new CreateUserService();

    const user = await service.execute(req.body);

    return res.status(201).json({
      success: true,
      data: user,
    });
  }

  async list(req: Request, res: Response) {
    const service = new GetUsersService();

    const users = await service.execute();

    return res.json({
      success: true,
      data: users,
    });
  }

  async me(req: Request, res: Response) {
    const service = new GetProfileService();

    const user = await service.execute(req.user!.id);

    return res.json({
      success: true,
      data: user,
    });
  }
}