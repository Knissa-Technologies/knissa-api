import "dotenv/config";
import { prisma } from "../src/infra/database/prisma";

async function main() {
  console.log("======================================");
  console.log("🌱 Starting seed...");
  console.log("======================================");

  console.log("DATABASE_URL:");
  console.log(process.env.DATABASE_URL);

  const before = await prisma.country.count();

  console.log("\nCountries BEFORE seed:", before);

  const result = await prisma.country.createMany({
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

  console.log("\ncreateMany result:");
  console.log(result);

  const afterCount = await prisma.country.count();

  console.log("\nCountries AFTER seed:", afterCount);

  const countries = await prisma.country.findMany();

  console.log("\nCountries inserted:");
  console.table(countries);

  console.log("\n======================================");
  console.log("✅ Seed completed successfully!");
  console.log("======================================");
}

main()
  .catch((error) => {
    console.error("\n❌ SEED ERROR:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
