
import { prisma } from "../../src/infra/database/prisma.js";

export async function seedCountries() {
  console.log("🌍 Seeding countries...");

  const countries = [
    {
      countryNumber: "COUNTRY-BR",
      iso2Code: "BR",
      iso3Code: "BRA",
      numericCode: "076",
      name: "Brazil",
      officialName: "Federative Republic of Brazil",
      flagEmoji: "🇧🇷",
      phoneCode: "+55",
      postalCodeLabel: "CEP",
      postalCodePattern: "^\\d{5}-?\\d{3}$",
    },
    {
      countryNumber: "COUNTRY-US",
      iso2Code: "US",
      iso3Code: "USA",
      numericCode: "840",
      name: "United States",
      officialName: "United States of America",
      flagEmoji: "🇺🇸",
      phoneCode: "+1",
      postalCodeLabel: "ZIP Code",
      postalCodePattern: "^\\d{5}(-\\d{4})?$",
    },
    {
      countryNumber: "COUNTRY-HT",
      iso2Code: "HT",
      iso3Code: "HTI",
      numericCode: "332",
      name: "Haiti",
      officialName: "Republic of Haiti",
      flagEmoji: "🇭🇹",
      phoneCode: "+509",
      postalCodeLabel: "Postal Code",
      postalCodePattern: null,
    },
    {
      countryNumber: "COUNTRY-CA",
      iso2Code: "CA",
      iso3Code: "CAN",
      numericCode: "124",
      name: "Canada",
      officialName: "Canada",
      flagEmoji: "🇨🇦",
      phoneCode: "+1",
      postalCodeLabel: "Postal Code",
      postalCodePattern: "^[A-Za-z]\\d[A-Za-z][ -]?\\d[A-Za-z]\\d$",
    },
    {
      countryNumber: "COUNTRY-CL",
      iso2Code: "CL",
      iso3Code: "CHL",
      numericCode: "152",
      name: "Chile",
      officialName: "Republic of Chile",
      flagEmoji: "🇨🇱",
      phoneCode: "+56",
      postalCodeLabel: "Postal Code",
      postalCodePattern: "^\\d{7}$",
    },
    {
      countryNumber: "COUNTRY-FR",
      iso2Code: "FR",
      iso3Code: "FRA",
      numericCode: "250",
      name: "France",
      officialName: "French Republic",
      flagEmoji: "🇫🇷",
      phoneCode: "+33",
      postalCodeLabel: "Code Postal",
      postalCodePattern: "^\\d{5}$",
    },
    {
      countryNumber: "COUNTRY-DO",
      iso2Code: "DO",
      iso3Code: "DOM",
      numericCode: "214",
      name: "Dominican Republic",
      officialName: "Dominican Republic",
      flagEmoji: "🇩🇴",
      phoneCode: "+1",
      postalCodeLabel: "Postal Code",
      postalCodePattern: "^\\d{5}$",
    },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: {
        iso2Code: country.iso2Code,
      },
      update: country,
      create: country,
    });
  }

  console.log(`✅ ${countries.length} countries seeded.`);
}
