-- AlterTable
ALTER TABLE "FarmerProfile" ADD COLUMN     "farmerCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FarmerProfile_farmerCode_key" ON "FarmerProfile"("farmerCode");
