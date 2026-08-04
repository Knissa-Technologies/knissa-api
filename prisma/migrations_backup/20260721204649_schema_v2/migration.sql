/*
  Warnings:

  - You are about to drop the column `countryId` on the `currencies` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountNumber]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currencyId` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netAmount` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Made the column `countryId` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `accountNumber` to the `wallets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "currencies" DROP CONSTRAINT "currencies_countryId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_countryId_fkey";

-- AlterTable
ALTER TABLE "currencies" DROP COLUMN "countryId";

-- AlterTable
ALTER TABLE "exchange_rates" ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "currencyId" TEXT NOT NULL,
ADD COLUMN     "netAmount" DECIMAL(18,2) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ALTER COLUMN "countryId" SET NOT NULL;

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "accountNumber" TEXT NOT NULL,
ADD COLUMN     "balance" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "transactions_currencyId_idx" ON "transactions"("currencyId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_accountNumber_key" ON "wallets"("accountNumber");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
