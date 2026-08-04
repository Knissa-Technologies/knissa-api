import { prisma } from "../../src/infra/database/prisma.js";

export async function seedCountryTimezones() {
  console.log("🌍🕒 Linking countries and timezones...");

  const relations = [
    { country: "BR", timezone: "America/Sao_Paulo", isDefault: true },
    { country: "US", timezone: "America/New_York", isDefault: true },
    { country: "HT", timezone: "America/Port-au-Prince", isDefault: true },
    { country: "CA", timezone: "America/Toronto", isDefault: true },
    { country: "CL", timezone: "America/Santiago", isDefault: true },
    { country: "FR", timezone: "Europe/Paris", isDefault: true },
    { country: "DO", timezone: "America/Santo_Domingo", isDefault: true },
  ];

  for (const relation of relations) {
    const country = await prisma.country.findUnique({
      where: {
        iso2Code: relation.country,
      },
    });

    const timezone = await prisma.timezone.findUnique({
      where: {
        name: relation.timezone,
      },
    });

    if (!country || !timezone) continue;

    await prisma.countryTimezone.upsert({
      where: {
        countryId_timezoneId: {
          countryId: country.id,
          timezoneId: timezone.id,
        },
      },
      update: {
        isDefault: relation.isDefault,
      },
      create: {
        countryId: country.id,
        timezoneId: timezone.id,
        isDefault: relation.isDefault,
      },
    });
  }

  console.log("✅ Country/Timezone relations created.");
}