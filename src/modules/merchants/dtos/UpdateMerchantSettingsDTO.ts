export interface UpdateMerchantSettingsDTO {
  displayName?: string;

  logoUrl?: string;

  websiteUrl?: string;

  supportEmail?: string;

  supportPhone?: string;

  languageId?: string;

  timezoneId?: string;

  currencyId?: string;

  allowWalletPayments?: boolean;

  allowQrCodePayments?: boolean;

  allowPaymentLinks?: boolean;

  autoSettlement?: boolean;

  emailNotifications?: boolean;

  smsNotifications?: boolean;

  pushNotifications?: boolean;

  whatsappNotifications?: boolean;
}