import argon2 from "argon2";
import jwt from "jsonwebtoken";

import { AppError } from "../../../shared/errors/AppError.js";

import { LoginDTO } from "../dto/LoginDTO.js";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { loginSchema } from "../validators/login.schema.js";

export class LoginService {
  constructor(
    private readonly authRepository = new AuthRepository()
  ) {}

  async execute(data: LoginDTO) {
    // Valida os dados de entrada
    const input = loginSchema.parse(data);

    // Busca o usuário pelo e-mail
    const user = await this.authRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError("Invalid credentials.", 401);
    }

    // Verifica a senha
    const passwordIsValid = await argon2.verify(
      user.passwordHash,
      input.password
    );

    if (!passwordIsValid) {
      throw new AppError("Invalid credentials.", 401);
    }

    // Verifica se a chave JWT está configurada
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured.");
    }

    // Gera o Access Token
    const accessToken = jwt.sign(
      {
        sub: user.id,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      }
    );

    // Remove o hash da senha da resposta
    const { passwordHash, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken,
    };
  }
}