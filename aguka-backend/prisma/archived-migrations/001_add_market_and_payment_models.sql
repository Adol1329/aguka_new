-- Add Crop table
CREATE TABLE IF NOT EXISTS "Crop" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameRw" TEXT,
    "nameFr" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- Create unique index on crop name
CREATE UNIQUE INDEX IF NOT EXISTS "Crop_nameEn_key" ON "Crop"("nameEn");

-- Add new fields to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "subscriptionType" TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "hasSensorAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "serviceAccessExpiresAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "hasMarketAccess" BOOLEAN NOT NULL DEFAULT false;

-- Create Payment table
CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "provider" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reference" TEXT NOT NULL,
    "transactionId" TEXT,
    "externalReference" TEXT,
    "completedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Payment_reference_key" UNIQUE ("reference")
);

-- Create Refund table
CREATE TABLE IF NOT EXISTS "Refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "refundTransactionId" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- Create PriceAlert table
CREATE TABLE IF NOT EXISTS "PriceAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "marketId" TEXT,
    "targetPrice" DECIMAL(10,2) NOT NULL,
    "currentPrice" DECIMAL(10,2),
    "alertType" TEXT NOT NULL DEFAULT 'price_above',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTriggered" BOOLEAN NOT NULL DEFAULT false,
    "lastTriggered" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceAlert_pkey" PRIMARY KEY ("id")
);

-- Update MarketPrice table to match new schema
ALTER TABLE "MarketPrice" 
ADD COLUMN IF NOT EXISTS "marketId" TEXT,
ADD COLUMN IF NOT EXISTS "trend" TEXT DEFAULT 'stable',
ADD COLUMN IF NOT EXISTS "trendPercentage" DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "Crop_category_idx" ON "Crop"("category");
CREATE INDEX IF NOT EXISTS "Crop_isActive_idx" ON "Crop"("isActive");

CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "Payment_transactionId_idx" ON "Payment"("transactionId");

CREATE INDEX IF NOT EXISTS "Refund_paymentId_idx" ON "Refund"("paymentId");
CREATE INDEX IF NOT EXISTS "Refund_status_idx" ON "Refund"("status");

CREATE INDEX IF NOT EXISTS "PriceAlert_userId_idx" ON "PriceAlert"("userId");
CREATE INDEX IF NOT EXISTS "PriceAlert_cropId_idx" ON "PriceAlert"("cropId");
CREATE INDEX IF NOT EXISTS "PriceAlert_isActive_idx" ON "PriceAlert"("isActive");
CREATE INDEX IF NOT EXISTS "PriceAlert_isTriggered_idx" ON "PriceAlert"("isTriggered");

CREATE INDEX IF NOT EXISTS "MarketPrice_cropId_idx" ON "MarketPrice"("cropId");
CREATE INDEX IF NOT EXISTS "MarketPrice_marketId_idx" ON "MarketPrice"("marketId");
CREATE INDEX IF NOT EXISTS "MarketPrice_recordedAt_idx" ON "MarketPrice"("recordedAt");

-- Insert initial crop data
INSERT INTO "Crop" ("id", "nameEn", "nameRw", "nameFr", "category") VALUES
('crop_maize', 'Maize', 'Inshuro', 'Maïs', 'cereal'),
('crop_beans', 'Beans', 'Ibinyabiga', 'Haricots', 'legume'),
('crop_rice', 'Rice', 'Uburiri', 'Riz', 'cereal'),
('crop_potatoes', 'Potatoes', 'Ibirayi', 'Pommes de terre', 'tuber'),
('crop_tomatoes', 'Tomatoes', 'Tomato', 'Tomates', 'vegetable'),
('crop_onions', 'Onions', 'Ubutunguru', 'Oignons', 'vegetable'),
('crop_cabbage', 'Cabbage', 'Imbuto', 'Chou', 'vegetable'),
('crop_carrots', 'Carrots', 'Imikara', 'Carottes', 'vegetable')
ON CONFLICT ("id") DO NOTHING;

-- Add foreign key constraints
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PriceAlert" ADD CONSTRAINT "PriceAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PriceAlert" ADD CONSTRAINT "PriceAlert_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketPrice" ADD CONSTRAINT "MarketPrice_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
