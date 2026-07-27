import { CountryRepository } from "../repositories/CountryRepository.js";

export class GetCountriesService {
  private readonly repository = new CountryRepository();

  async execute() {
    return this.repository.findAll();
  }
}