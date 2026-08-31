-- CreateTable
CREATE TABLE "UssdSessionEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "serviceCode" TEXT,
    "networkCode" TEXT,
    "status" TEXT NOT NULL,
    "durationInMillis" INTEGER,
    "currencyCode" TEXT,
    "amount" DOUBLE PRECISION,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UssdSessionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UssdSessionEvent_sessionId_idx" ON "UssdSessionEvent"("sessionId");

-- CreateIndex
CREATE INDEX "UssdSessionEvent_phoneNumber_idx" ON "UssdSessionEvent"("phoneNumber");

-- CreateIndex
CREATE INDEX "UssdSessionEvent_createdAt_idx" ON "UssdSessionEvent"("createdAt");
