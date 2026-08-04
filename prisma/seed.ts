import "dotenv/config";

import { prisma } from "../src/infra/database/prisma.js";

import { seedCountries } from "./seeds/countries.seed.js";
import { seedCurrencies} from "./seeds/currencies.seed.js";
import { seedLanguages } from "./seeds/languages.seed.js";
import { seedTimezones } from "./seeds/timezones.seed.js";
import { seedCountryCurrencies } from "./seeds/country-currencies.seed.js";
import { seedCountryLanguages } from "./seeds/country-languages.seed.js";
import { seedCountryTimezones } from "./seeds/country-timezones.seed.js";
import { seedNotificationProviders } from "./seeds/notification-providers.seed.js";

async function main() {
  console.log("======================================");
  console.log("🌱 Starting Knissa Seed...");
  console.log("======================================");

  await seedCountries();
  await seedCurrencies();
  await seedLanguages();
  await seedTimezones();

  await seedCountryCurrencies();
  await seedCountryLanguages();
  await seedCountryTimezones();

  await seedNotificationProviders();

  console.log("\n======================================");
  console.log("✅ Knissa Seed completed successfully!");
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