import { prisma } from "../../src/infra/database/prisma.js";

export async function seedCountryCurrencies() {
  console.log("🌍💰 Linking countries and currencies...");

  const relations = [
    { country: "BR", currency: "BRL", isDefault: true },
    { country: "US", currency: "USD", isDefault: true },
    { country: "HT", currency: "HTG", isDefault: true },
    { country: "CA", currency: "CAD", isDefault: true },
    { country: "CL", currency: "CLP", isDefault: true },
    { country: "FR", currency: "EUR", isDefault: true },
    { country: "DO", currency: "DOP", isDefault: true },
  ];

  for (const relation of relations) {
    const country = await prisma.country.findUnique({
      where: {
        iso2Code: relation.country,
      },
    });

    const currency = await prisma.currency.findUnique({
      where: {
        code: relation.currency,
      },
    });

    if (!country || !currency) continue;

    await prisma.countryCurrency.upsert({
      where: {
        countryId_currencyId: {
          countryId: country.id,
          currencyId: currency.id,
        },
      },
      update: {
        isDefault: relation.isDefault,
      },
      create: {
        countryId: country.id,
        currencyId: currency.id,
        isDefault: relation.isDefault,
      },
    });
  }

  console.log("✅ Country/Currency relations created.");
}