import { CountryRepository } from "../repositories/CountryRepository.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

interface UpdateCountryDTO {
  name?: string;
  phoneCode?: string;
  currencyCode?: string;
}

export class UpdateCountryService {
  private readonly repository = new CountryRepository();

  async execute(id: string, data: UpdateCountryDTO) {
    const country = await this.repository.findById(id);

    if (!country) {
      throw new NotFoundError("Country not found.");
    }

    return this.repository.update(id, data);
  }
}