import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

import { UpdateUserDTO } from "../dtos/UpdateUserDTO.js";
import { UsersRepository } from "../repositories/UsersRepository.js";

export class UsersService {
  private usersRepository = new UsersRepository();

  async findAll() {
    return this.usersRepository.findAll();
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    return user;
  }

  async update(id: string, data: UpdateUserDTO) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    if (data.email && data.email !== user.email) {
      const emailExists = await this.usersRepository.findByEmail(data.email);

      if (emailExists) {
        throw new ConflictError("Email already exists.");
      }
    }

    return this.usersRepository.update(id, data);
  }

  async delete(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    await this.usersRepository.softDelete(id);
  }
}
