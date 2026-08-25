import { ComplianceDecision } from "@prisma/client";

export interface CreateComplianceReviewDTO {
  complianceProfileId: string;
  decision: ComplianceDecision;
  notes?: string;
  riskScore?: number;
  reviewDuration?: number;
}
