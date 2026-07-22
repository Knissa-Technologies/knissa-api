export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  countryId: string;
}