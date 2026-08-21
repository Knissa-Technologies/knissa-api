-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "paymentLinkId" TEXT;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_paymentLinkId_fkey" FOREIGN KEY ("paymentLinkId") REFERENCES "payment_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;
