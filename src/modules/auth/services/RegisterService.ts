import argon2 from "argon2";

import { AppError } from "../../../shared/errors/AppError.js";

import { RegisterDTO } from "../dto/RegisterDTO.js";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { registerSchema } from "../validators/register.schema.js";

import { OpenAccountService } from "../../wallets/services/OpenAccountService.js";

export class RegisterService {
  constructor(
    private readonly authRepository = new AuthRepository(),
    private readonly openAccountService = new OpenAccountService()
  ) { }

  async execute(data: RegisterDTO) {
    // Validação
    const input = registerSchema.parse(data);

    // Verifica se o e-mail já existe
    const userAlreadyExists = await this.authRepository.findByEmail(
      input.email
    );

    if (userAlreadyExists) {
      throw new AppError("Email already registered.", 409);
    }

    // Gera o hash da senha
    const passwordHash = await argon2.hash(input.password);

    // Cria o usuário
    const user = await this.authRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      phone: input.phone,
      countryId: input.countryId,
    });

    // Abre automaticamente a primeira conta do usuário
    console.log("✅ User created:", user.id);
    console.log("📌 Opening wallet...");

    await this.openAccountService.execute(
      user.id,
      input.countryId
    );

    console.log("✅ Wallet created");

    return user;
  }
}