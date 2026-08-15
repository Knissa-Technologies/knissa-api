export interface UpdateProfileDTO {
  displayName?: string;
  legalName?: string;

  firstName?: string;
  middleName?: string | null;
  lastName?: string;

  birthDate?: Date | null;

  phoneCountryCode?: string | null;
  phoneNumber?: string | null;

  avatarUrl?: string | null;

  languageCode?: string | null;
  languageId?: string | null;

  timezoneId?: string | null;
}