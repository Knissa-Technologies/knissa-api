import "dotenv/config";
import { prisma } from "../src/infra/database/prisma.js";

async function main() {
  console.log("======================================");
  console.log("🌱 Starting Knissa Seed...");
  console.log("======================================");

  // =====================================================
  // COUNTRIES
  // =====================================================

  console.log("\n🌍 Seeding countries...");

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

  console.table(await prisma.country.findMany());

  // =====================================================
  // CURRENCIES
  // =====================================================

  console.log("\n💰 Seeding currencies...");

  await prisma.currency.createMany({
    data: [
      {
        code: "BRL",
        name: "Brazilian Real",
        symbol: "R$",
      },
      {
        code: "USD",
        name: "US Dollar",
        symbol: "$",
      },
      {
        code: "HTG",
        name: "Haitian Gourde",
        symbol: "G",
      },
      {
        code: "CAD",
        name: "Canadian Dollar",
        symbol: "C$",
      },
      {
        code: "EUR",
        name: "Euro",
        symbol: "€",
      },
    ],
    skipDuplicates: true,
  });

  console.table(await prisma.currency.findMany());

  console.log("\n======================================");
  console.log("✅ Knissa seed completed successfully!");
  console.log("======================================");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });