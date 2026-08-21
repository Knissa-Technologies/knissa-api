-- CreateEnum
CREATE TYPE "PaymentLinkStatus" AS ENUM ('ACTIVE', 'PAID', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "payment_links" (
    "id" TEXT NOT NULL,
    "paymentLinkNumber" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "description" TEXT,
    "externalReference" TEXT,
    "status" "PaymentLinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_paymentLinkNumber_key" ON "payment_links"("paymentLinkNumber");

-- CreateIndex
CREATE INDEX "payment_links_merchantId_idx" ON "payment_links"("merchantId");

-- CreateIndex
CREATE INDEX "payment_links_currencyId_idx" ON "payment_links"("currencyId");

-- CreateIndex
CREATE INDEX "payment_links_status_idx" ON "payment_links"("status");

-- CreateIndex
CREATE INDEX "payment_links_expiresAt_idx" ON "payment_links"("expiresAt");

-- CreateIndex
CREATE INDEX "payment_links_createdAt_idx" ON "payment_links"("createdAt");

-- AddForeignKey
ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
