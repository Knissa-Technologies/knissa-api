import { prisma } from "../../src/infra/database/prisma.js";

export async function seedTimezones() {
  console.log("🌎 Seeding timezones...");

  const timezones = [
    {
      timezoneNumber: "TZ-BR",
      name: "America/Sao_Paulo",
      utcOffset: "-03:00",
    },
    {
      timezoneNumber: "TZ-US",
      name: "America/New_York",
      utcOffset: "-05:00",
    },
    {
      timezoneNumber: "TZ-HT",
      name: "America/Port-au-Prince",
      utcOffset: "-05:00",
    },
    {
      timezoneNumber: "TZ-CA",
      name: "America/Toronto",
      utcOffset: "-05:00",
    },
    {
      timezoneNumber: "TZ-CL",
      name: "America/Santiago",
      utcOffset: "-04:00",
    },
    {
      timezoneNumber: "TZ-DO",
      name: "America/Santo_Domingo",
      utcOffset: "-04:00",
    },
    {
      timezoneNumber: "TZ-FR",
      name: "Europe/Paris",
      utcOffset: "+01:00",
    },
  ];

  for (const timezone of timezones) {
    await prisma.timezone.upsert({
      where: {
        name: timezone.name,
      },
      update: timezone,
      create: timezone,
    });
  }

  console.log(`✅ ${timezones.length} timezones seeded.`);
}