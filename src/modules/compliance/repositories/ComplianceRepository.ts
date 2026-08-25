import {
  ComplianceDecision,
  ComplianceDocumentStatus,
  ComplianceProfile,
  ComplianceReview,
  DocumentType,
  Prisma,
  VerificationStatus,
} from "@prisma/client";


import { prisma } from "../../../infra/database/prisma.js";

export class ComplianceRepository {
  // ======================================================
  // COMPLIANCE PROFILE
  // ======================================================

  async findProfileByAccountId(
    accountId: string,
  ): Promise<ComplianceProfile | null> {
    return prisma.complianceProfile.findUnique({
      where: {
        accountId,
      },
    });
  }

  async findProfileById(
    id: string,
  ): Promise<ComplianceProfile | null> {
    return prisma.complianceProfile.findUnique({
      where: {
        id,
      },
    });
  }

  async createProfile(
    accountId: string,
    complianceProfileNumber: string,
  ): Promise<ComplianceProfile> {
    return prisma.complianceProfile.create({
      data: {
        accountId,
        complianceProfileNumber,
      },
    });
  }

  async updateProfileStatus(
    id: string,
    verificationStatus: VerificationStatus,
    data?: {
      verifiedAt?: Date;
      lastReviewAt?: Date;
    },
  ): Promise<ComplianceProfile> {
    return prisma.complianceProfile.update({
      where: {
        id,
      },
      data: {
        verificationStatus,
        ...data,
      },
    });
  }

  // ======================================================
  // DOCUMENTS
  // ======================================================

  async createDocument(
    data: Prisma.ComplianceDocumentUncheckedCreateInput,
  ) {
    return prisma.complianceDocument.create({
      data,
    });
  }

  async findDocumentsByProfileId(
    complianceProfileId: string,
  ) {
    return prisma.complianceDocument.findMany({
      where: {
        complianceProfileId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findDocumentById(
    id: string,
  ) {
    return prisma.complianceDocument.findUnique({
      where: {
        id,
      },
    });
  }

  async updateDocumentStatus(
    id: string,
    status: ComplianceDocumentStatus,
    data?: {
      verifiedAt?: Date;
      rejectionReason?: string | null;
    },
  ) {
    return prisma.complianceDocument.update({
      where: {
        id,
      },
      data: {
        status,
        ...data,
      },
    });
  }

  // ======================================================
  // REVIEWS
  // ======================================================

  async createReview(
    data: Prisma.ComplianceReviewUncheckedCreateInput,
  ): Promise<ComplianceReview> {
    return prisma.complianceReview.create({
      data,
    });
  }

  async findPendingProfiles() {
    return prisma.complianceProfile.findMany({
      where: {
        verificationStatus: {
          in: [
            VerificationStatus.PENDING,
            VerificationStatus.IN_REVIEW,
          ],
        },
      },
      include: {
        account: {
          include: {
            profile: true,
          },
        },
        documents: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findReviewsByProfileId(
    complianceProfileId: string,
  ) {
    return prisma.complianceReview.findMany({
      where: {
        complianceProfileId,
      },
      include: {
        reviewedBy: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
