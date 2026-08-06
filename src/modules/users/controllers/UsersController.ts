import { Request, Response } from "express";

import { ApiResponse } from "../../../shared/http/ApiResponse.js";
import type { IdParams } from "../../../shared/http/RouteParams.js";

import { UsersService } from "../services/UsersService.js";

export class UsersController {
  private usersService = new UsersService();

  async findAll(req: Request, res: Response) {
    const users = await this.usersService.findAll();

    return res.json(ApiResponse.success(users));
  }

  async findById(req: Request<IdParams>, res: Response) {
    const user = await this.usersService.findById(req.params.id);

    return res.json(ApiResponse.success(user));
  }

  async update(req: Request<IdParams>, res: Response) {
    const user = await this.usersService.update(req.params.id, req.body);

    return res.json(ApiResponse.success(user, "User updated successfully."));
  }

  async delete(req: Request<IdParams>, res: Response) {
    await this.usersService.delete(req.params.id);

    return res.json(ApiResponse.success(null, "User deleted successfully."));
  }
}
