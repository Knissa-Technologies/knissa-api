import { CountryRepository } from "../repositories/CountryRepository.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

export class GetCountryByIdService {
  private readonly repository = new CountryRepository();

  async execute(id: string) {
    const country = await this.repository.findById(id);

    if (!country) {
      throw new NotFoundError("Country not found.");
    }

    return country;
  }
}