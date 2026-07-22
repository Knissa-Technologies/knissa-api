import argon2 from "argon2";

import { CreateUserDTO } from "../dto/CreateUserDTO.js";
import { UsersRepository } from "../repositories/UsersRepository.js";
import { createUserSchema } from "../validators/createUser.schema.js";
import { AppError } from "../../../shared/errors/AppError.js";

import { OpenAccountService } from "../../wallets/services/OpenAccountService.js";

export class CreateUserService {
  constructor(
    private readonly usersRepository = new UsersRepository(),
    private readonly openAccountService = new OpenAccountService()
  ) { }

  async execute(data: CreateUserDTO) {
    const input = createUserSchema.parse(data);

    const existingUser = await this.usersRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError("Email already registered.", 409);
    }

    const passwordHash = await argon2.hash(input.password);

    const user = await this.usersRepository.create({
      ...input,
      password: passwordHash,
    });

    await this.openAccountService.execute(
      user.id,
      input.countryId
    );

    const {
      passwordHash: passwordHashFromDb,
      ...userWithoutPassword
    } = user;

    return userWithoutPassword;
  }
}