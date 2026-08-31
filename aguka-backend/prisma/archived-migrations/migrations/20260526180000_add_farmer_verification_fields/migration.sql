-- Farmer farm verification (admin verify flow)
ALTER TABLE "FarmerProfile" ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "FarmerProfile" ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT;
ALTER TABLE "FarmerProfile" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);
