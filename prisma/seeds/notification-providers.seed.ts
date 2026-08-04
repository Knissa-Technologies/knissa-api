import { prisma } from "../../src/infra/database/prisma.js";
import { NotificationProviderType } from "@prisma/client";

export async function seedNotificationProviders() {
  console.log("📨 Seeding notification providers...");

  const providers = [
    {
      notificationProviderNumber: "NP-EMAIL",
      name: "SMTP",
      type: NotificationProviderType.EMAIL,
      isDefault: true,
      isActive: true,
      configuration: {},
    },
    {
      notificationProviderNumber: "NP-SMS",
      name: "Twilio",
      type: NotificationProviderType.SMS,
      isDefault: true,
      isActive: true,
      configuration: {},
    },
    {
      notificationProviderNumber: "NP-PUSH",
      name: "Firebase",
      type: NotificationProviderType.PUSH,
      isDefault: true,
      isActive: true,
      configuration: {},
    },
    {
      notificationProviderNumber: "NP-WHATSAPP",
      name: "WhatsApp Business",
      type: NotificationProviderType.WHATSAPP,
      isDefault: true,
      isActive: true,
      configuration: {},
    },
  ];

  for (const provider of providers) {
    await prisma.notificationProvider.upsert({
      where: {
        notificationProviderNumber: provider.notificationProviderNumber,
      },
      update: provider,
      create: provider,
    });
  }

  console.log(`✅ ${providers.length} notification providers seeded.`);
}