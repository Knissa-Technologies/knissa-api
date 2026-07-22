export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  countryId: string;
}