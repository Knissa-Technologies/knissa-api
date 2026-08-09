export interface RegisterDTO {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  languageCode?: string;
  referralCode?: string;
}
