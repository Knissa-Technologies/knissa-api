import { prisma } from "../../src/infra/database/prisma.js";

export async function seedLanguages() {
  console.log("🗣️ Seeding languages...");

  const languages = [
    {
      languageNumber: "LANG-PT",
      code: "pt",
      name: "Portuguese",
      nativeName: "Português",
      isActive: true,
    },
    {
      languageNumber: "LANG-EN",
      code: "en",
      name: "English",
      nativeName: "English",
      isActive: true,
    },
    {
      languageNumber: "LANG-FR",
      code: "fr",
      name: "French",
      nativeName: "Français",
      isActive: true,
    },
    {
      languageNumber: "LANG-HT",
      code: "ht",
      name: "Haitian Creole",
      nativeName: "Kreyòl Ayisyen",
      isActive: true,
    },
    {
      languageNumber: "LANG-ES",
      code: "es",
      name: "Spanish",
      nativeName: "Español",
      isActive: true,
    },
  ];

  for (const language of languages) {
    await prisma.language.upsert({
      where: {
        code: language.code,
      },
      update: language,
      create: language,
    });
  }

  console.log(`✅ ${languages.length} languages seeded.`);
}