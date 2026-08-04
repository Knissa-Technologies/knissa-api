import { prisma } from "../../src/infra/database/prisma.js";

export async function seedCurrencies() {
  console.log("💰 Seeding currencies...");

  const currencies = [
    {
      currencyNumber: "CURRENCY-BRL",
      code: "BRL",
      name: "Brazilian Real",
      symbol: "R$",
      decimals: 2,
      isActive: true,
    },
    {
      currencyNumber: "CURRENCY-USD",
      code: "USD",
      name: "United States Dollar",
      symbol: "$",
      decimals: 2,
      isActive: true,
    },
    {
      currencyNumber: "CURRENCY-HTG",
      code: "HTG",
      name: "Haitian Gourde",
      symbol: "G",
      decimals: 2,
      isActive: true,
    },
    {
      currencyNumber: "CURRENCY-CAD",
      code: "CAD",
      name: "Canadian Dollar",
      symbol: "C$",
      decimals: 2,
      isActive: true,
    },
    {
      currencyNumber: "CURRENCY-CLP",
      code: "CLP",
      name: "Chilean Peso",
      symbol: "$",
      decimals: 0,
      isActive: true,
    },
    {
      currencyNumber: "CURRENCY-EUR",
      code: "EUR",
      name: "Euro",
      symbol: "€",
      decimals: 2,
      isActive: true,
    },
    {
      currencyNumber: "CURRENCY-DOP",
      code: "DOP",
      name: "Dominican Peso",
      symbol: "RD$",
      decimals: 2,
      isActive: true,
    },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: {
        code: currency.code,
      },
      update: currency,
      create: currency,
    });
  }

  console.log(`✅ ${currencies.length} currencies seeded.`);
}