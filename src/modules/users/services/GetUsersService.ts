import { UsersRepository } from "../repositories/UsersRepository.js";

export class GetUsersService {
  constructor(
    private readonly usersRepository = new UsersRepository()
  ) {}

  async execute() {
    return this.usersRepository.findAll();
  }
}