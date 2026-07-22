/*
  Warnings:

  - Made the column `reference` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "externalReference" TEXT,
ADD COLUMN     "feeAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
ALTER COLUMN "reference" SET NOT NULL;

-- CreateIndex
CREATE INDEX "transactions_reference_idx" ON "transactions"("reference");
