import {
  ComplianceDecision,
  ComplianceDocumentStatus,
  RiskLevel,
  VerificationLevel,
  VerificationStatus,
} from "@prisma/client";

import { ComplianceRepository } from "../repositories/ComplianceRepository.js";

import type { CreateComplianceDocumentDTO } from "../dtos/CreateComplianceDocumentDTO.js";
import type { CreateComplianceReviewDTO } from "../dtos/CreateComplianceReviewDTO.js";

import { prisma } from "../../../infra/database/prisma.js";

export class ComplianceService {
  private readonly complianceRepository =
    new ComplianceRepository();

  // ======================================================
  // GET CURRENT USER ACCOUNT
  // ======================================================

  private async getAccountByUserId(userId: string) {
    const account = await prisma.account.findFirst({
      where: {
        profile: {
          userId,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!account) {
      throw new Error("Account not found.");
    }

    return account;
  }

  // ======================================================
  // GET OR CREATE COMPLIANCE PROFILE
  // ======================================================

  private async getOrCreateComplianceProfile(
    accountId: string,
  ) {
    let profile =
      await this.complianceRepository.findProfileByAccountId(
        accountId,
      );

    if (!profile) {
      const complianceProfileNumber =
        `CMP-${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;

      profile =
        await this.complianceRepository.createProfile(
          accountId,
          complianceProfileNumber,
        );
    }

    return profile;
  }

  // ======================================================
  // CURRENT USER COMPLIANCE PROFILE
  // ======================================================

  async getMyComplianceProfile(userId: string) {
    const account =
      await this.getAccountByUserId(userId);

    const profile =
      await this.getOrCreateComplianceProfile(
        account.id,
      );

    const documents =
      await this.complianceRepository.findDocumentsByProfileId(
        profile.id,
      );

    return {
      ...profile,
      documents,
    };
  }

  // ======================================================
  // CREATE DOCUMENT
  // ======================================================

  async createDocument(
    userId: string,
    data: CreateComplianceDocumentDTO,
  ) {
    const account =
      await this.getAccountByUserId(userId);

    const profile =
      await this.getOrCreateComplianceProfile(
        account.id,
      );

    const documentNumber =
      `DOC-${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;

    const document =
      await this.complianceRepository.createDocument({
        complianceDocumentNumber: documentNumber,

        complianceProfileId: profile.id,

        type: data.type,

        countryId: data.countryId,

        documentIdentifier:
          data.documentIdentifier,

        issuingAuthority:
          data.issuingAuthority,

        issuedAt:
          data.issuedAt
            ? new Date(data.issuedAt)
            : undefined,

        expiresAt:
          data.expiresAt
            ? new Date(data.expiresAt)
            : undefined,

        frontImageUrl:
          data.frontImageUrl,

        backImageUrl:
          data.backImageUrl,

        selfieImageUrl:
          data.selfieImageUrl,

        status:
          ComplianceDocumentStatus.PENDING,
      });

    await this.complianceRepository.updateProfileStatus(
      profile.id,
      VerificationStatus.IN_REVIEW,
    );

    return document;
  }

  // ======================================================
  // LIST MY DOCUMENTS
  // ======================================================

  async getMyDocuments(userId: string) {
    const account =
      await this.getAccountByUserId(userId);

    const profile =
      await this.getOrCreateComplianceProfile(
        account.id,
      );

    return this.complianceRepository.findDocumentsByProfileId(
      profile.id,
    );
  }

  // ======================================================
  // GET DOCUMENT BY ID
  // ======================================================

  async getDocumentById(
    userId: string,
    documentId: string,
  ) {
    const account =
      await this.getAccountByUserId(userId);

    const profile =
      await this.getOrCreateComplianceProfile(
        account.id,
      );

    const document =
      await this.complianceRepository.findDocumentById(
        documentId,
      );

    if (!document) {
      throw new Error("Compliance document not found.");
    }

    if (
      document.complianceProfileId !==
      profile.id
    ) {
      throw new Error(
        "You do not have permission to access this document.",
      );
    }

    return document;
  }

  // ======================================================
  // ADMIN — PENDING PROFILES
  // ======================================================

  async getPendingProfiles() {
    return this.complianceRepository.findPendingProfiles();
  }

  // ======================================================
  // ADMIN — CREATE REVIEW
  // ======================================================

  async createReview(
    reviewedByUserId: string,
    data: CreateComplianceReviewDTO,
  ) {
    const complianceProfile =
      await this.complianceRepository.findProfileById(
        data.complianceProfileId,
      );

    if (!complianceProfile) {
      throw new Error(
        "Compliance profile not found.",
      );
    }

    const reviewerAccount =
      await this.getAccountByUserId(
        reviewedByUserId,
      );

    const reviewNumber =
      `REV-${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;

    const review =
      await this.complianceRepository.createReview({
        complianceReviewNumber: reviewNumber,

        complianceProfileId:
          data.complianceProfileId,

        reviewedByAccountId:
          reviewerAccount.id,

        decision:
          data.decision,

        notes:
          data.notes,

        riskScore:
          data.riskScore,

        reviewDuration:
          data.reviewDuration,

        reviewedAt:
          new Date(),
      });

    // ==========================================
    // UPDATE COMPLIANCE PROFILE
    // ==========================================

    if (
      data.decision ===
      ComplianceDecision.APPROVED
    ) {
      await this.complianceRepository.updateProfileStatus(
        complianceProfile.id,
        VerificationStatus.APPROVED,
        {
          verifiedAt: new Date(),
          lastReviewAt: new Date(),
        },
      );
    }

    if (
      data.decision ===
      ComplianceDecision.REJECTED
    ) {
      await this.complianceRepository.updateProfileStatus(
        complianceProfile.id,
        VerificationStatus.REJECTED,
        {
          lastReviewAt: new Date(),
        },
      );
    }

    if (
      data.decision ===
      ComplianceDecision.MANUAL_REVIEW
    ) {
      await this.complianceRepository.updateProfileStatus(
        complianceProfile.id,
        VerificationStatus.IN_REVIEW,
        {
          lastReviewAt: new Date(),
        },
      );
    }

    return review;
  }
}
