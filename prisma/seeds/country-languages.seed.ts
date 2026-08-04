import { prisma } from "../../src/infra/database/prisma.js";

export async function seedCountryLanguages () {
  console.log("🌍🗣️ Linking countries and languages...");

  const relations = [
    { country: "BR", language: "pt", isOfficial: true },

    { country: "US", language: "en", isOfficial: true },

    { country: "HT", language: "fr", isOfficial: true },
    { country: "HT", language: "ht", isOfficial: true },

    { country: "CA", language: "en", isOfficial: true },
    { country: "CA", language: "fr", isOfficial: true },

    { country: "CL", language: "es", isOfficial: true },

    { country: "FR", language: "fr", isOfficial: true },

    { country: "DO", language: "es", isOfficial: true },
  ];

  for (const relation of relations) {
    const country = await prisma.country.findUnique({
      where: {
        iso2Code: relation.country,
      },
    });

    const language = await prisma.language.findUnique({
      where: {
        code: relation.language,
      },
    });

    if (!country || !language) continue;

    await prisma.countryLanguage.upsert({
      where: {
        countryId_languageId: {
          countryId: country.id,
          languageId: language.id,
        },
      },
      update: {
        isOfficial: relation.isOfficial,
      },
      create: {
        countryId: country.id,
        languageId: language.id,
        isOfficial: relation.isOfficial,
      },
    });
  }

  console.log("✅ Country/Language relations created.");
}