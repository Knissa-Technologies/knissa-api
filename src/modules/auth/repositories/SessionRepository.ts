import { SessionStatus } from "@prisma/client";

import { prisma } from "../../../infra/database/prisma.js";

export class SessionRepository {
  async create(data: {
    reference: string;
    userId: string;
    refreshTokenHash: string;
    deviceName?: string | null;
    deviceType?:
      "DESKTOP" | "LAPTOP" | "MOBILE" | "TABLET" | "SMART_TV" | "UNKNOWN";
    operatingSystem?: string | null;
    browser?: string | null;
    browserVersion?: string | null;
    fingerprint?: string | null;
    isTrusted?: boolean;
    ipAddress?: string | null;
    countryCode?: string | null;
    city?: string | null;
    expiresAt: Date;
  }) {
    return prisma.session.create({
      data: {
        reference: data.reference,
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        deviceName: data.deviceName ?? null,
        deviceType: data.deviceType ?? "UNKNOWN",
        operatingSystem: data.operatingSystem ?? null,
        browser: data.browser ?? null,
        browserVersion: data.browserVersion ?? null,
        fingerprint: data.fingerprint ?? null,
        isTrusted: data.isTrusted ?? false,
        ipAddress: data.ipAddress ?? null,
        countryCode: data.countryCode ?? null,
        city: data.city ?? null,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByReference(reference: string) {
    return prisma.session.findUnique({
      where: {
        reference,
      },
    });
  }

  async findActiveByUserId(userId: string) {
    return prisma.session.findMany({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
        revokedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.session.findUnique({
      where: {
        id,
      },
    });
  }

  async rotateRefreshToken(
    id: string,
    currentRefreshTokenHash: string,
    newRefreshTokenHash: string,
    expiresAt: Date,
  ) {
    return prisma.session.update({
      where: {
        id,
      },
      data: {
        previousRefreshTokenHash: currentRefreshTokenHash,
        refreshTokenHash: newRefreshTokenHash,
        expiresAt,
        status: SessionStatus.ACTIVE,
        revokedAt: null,
        revokedReason: null,
        lastActivityAt: new Date(),
      },
    });
  }

  async revoke(
    id: string,
    reason:
      | "USER_LOGOUT"
      | "PASSWORD_CHANGED"
      | "ADMIN_REVOKED"
      | "SUSPICIOUS_ACTIVITY"
      | "TOKEN_REUSE",
  ) {
    return prisma.session.update({
      where: {
        id,
      },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }

  async revokeAllByUserId(
    userId: string,
    reason:
      | "USER_LOGOUT"
      | "PASSWORD_CHANGED"
      | "ADMIN_REVOKED"
      | "SUSPICIOUS_ACTIVITY"
      | "TOKEN_REUSE",
  ) {
    return prisma.session.updateMany({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
        revokedAt: null,
      },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }

  async updateLastActivity(id: string) {
    return prisma.session.update({
      where: {
        id,
      },
      data: {
        lastActivityAt: new Date(),
      },
    });
  }

  async findByRefreshTokenHash(refreshTokenHash: string) {
    return prisma.session.findFirst({
      where: {
        OR: [
          {
            refreshTokenHash,
          },
          {
            previousRefreshTokenHash: refreshTokenHash,
          },
        ],
      },
    });
  }
}
