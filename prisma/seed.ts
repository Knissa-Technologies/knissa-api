import "dotenv/config";
import { prisma } from "../src/infra/database/prisma";

async function main() {
  console.log("🌱 Starting seed...");

  // Countries
  await prisma.country.createMany({
    data: [
      {
        name: "Brazil",
        isoCode: "BR",
        phoneCode: "+55",
        currencyCode: "BRL",
      },
      {
        name: "Haiti",
        isoCode: "HT",
        phoneCode: "+509",
        currencyCode: "HTG",
      },
      {
        name: "United States",
        isoCode: "US",
        phoneCode: "+1",
        currencyCode: "USD",
      },
      {
        name: "Canada",
        isoCode: "CA",
        phoneCode: "+1",
        currencyCode: "CAD",
      },
      {
        name: "France",
        isoCode: "FR",
        phoneCode: "+33",
        currencyCode: "EUR",
      },
    ],
    skipDuplicates: true,
  });

  // Currencies
  await prisma.currency.createMany({
    data: [
      {
        code: "BRL",
        name: "Brazilian Real",
        symbol: "R$",
        decimals: 2,
      },
      {
        code: "USD",
        name: "US Dollar",
        symbol: "$",
        decimals: 2,
      },
      {
        code: "EUR",
        name: "Euro",
        symbol: "€",
        decimals: 2,
      },
      {
        code: "HTG",
        name: "Haitian Gourde",
        symbol: "G",
        decimals: 2,
      },
      {
        code: "CAD",
        name: "Canadian Dollar",
        symbol: "C$",
        decimals: 2,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });