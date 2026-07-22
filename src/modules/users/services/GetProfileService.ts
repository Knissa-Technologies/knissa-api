import { AppError } from "../../../shared/errors/AppError.js";
import { UsersRepository } from "../repositories/UsersRepository.js";

export class GetProfileService {
  constructor(
    private readonly usersRepository = new UsersRepository()
  ) {}

  async execute(userId: string) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const { password, ...safeUser } = user;

    return safeUser;
  }
}