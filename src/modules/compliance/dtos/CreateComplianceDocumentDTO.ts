import { DocumentType } from "@prisma/client";

export interface CreateComplianceDocumentDTO {
  type: DocumentType;
  countryId: string;
  documentIdentifier: string;
  issuingAuthority?: string;
  issuedAt?: string;
  expiresAt?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  selfieImageUrl?: string;
}
