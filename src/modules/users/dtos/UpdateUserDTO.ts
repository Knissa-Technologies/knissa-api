import { UserStatus } from "@prisma/client";

export interface UpdateUserDTO {
  email?: string;
  status?: UserStatus;
}