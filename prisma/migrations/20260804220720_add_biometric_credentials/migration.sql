-- CreateEnum
CREATE TYPE "BiometricType" AS ENUM ('FINGERPRINT', 'FACE', 'IRIS');

-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('IOS', 'ANDROID', 'WEB', 'WINDOWS', 'MACOS', 'LINUX');

-- CreateTable
CREATE TABLE "biometric_credentials" (
    "id" TEXT NOT NULL,
    "biometricNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT,
    "platform" "DevicePlatform" NOT NULL,
    "biometricType" "BiometricType" NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "signCount" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biometric_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "biometric_credentials_biometricNumber_key" ON "biometric_credentials"("biometricNumber");

-- CreateIndex
CREATE UNIQUE INDEX "biometric_credentials_credentialId_key" ON "biometric_credentials"("credentialId");

-- CreateIndex
CREATE INDEX "biometric_credentials_userId_idx" ON "biometric_credentials"("userId");

-- CreateIndex
CREATE INDEX "biometric_credentials_sessionId_idx" ON "biometric_credentials"("sessionId");

-- CreateIndex
CREATE INDEX "biometric_credentials_deviceId_idx" ON "biometric_credentials"("deviceId");

-- CreateIndex
CREATE INDEX "biometric_credentials_platform_idx" ON "biometric_credentials"("platform");

-- CreateIndex
CREATE INDEX "biometric_credentials_isEnabled_idx" ON "biometric_credentials"("isEnabled");

-- CreateIndex
CREATE INDEX "biometric_credentials_lastUsedAt_idx" ON "biometric_credentials"("lastUsedAt");

-- AddForeignKey
ALTER TABLE "biometric_credentials" ADD CONSTRAINT "biometric_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometric_credentials" ADD CONSTRAINT "biometric_credentials_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
