import { CountryRepository } from "../repositories/CountryRepository.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";

interface CreateCountryDTO {
  name: string;
  isoCode: string;
  phoneCode?: string;
  currencyCode?: string;
}

export class CreateCountryService {
  private readonly repository = new CountryRepository();

  async execute(data: CreateCountryDTO) {
    const exists = await this.repository.findByIsoCode(data.isoCode);

    if (exists) {
      throw new ConflictError("Country already exists.");
    }

    return this.repository.create(data);
  }
}