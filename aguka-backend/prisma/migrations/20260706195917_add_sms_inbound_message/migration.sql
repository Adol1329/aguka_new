-- CreateTable
CREATE TABLE "SmsInboundMessage" (
    "id" TEXT NOT NULL,
    "providerId" TEXT,
    "linkId" TEXT,
    "fromPhone" TEXT NOT NULL,
    "toPhone" TEXT,
    "text" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsInboundMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmsInboundMessage_fromPhone_idx" ON "SmsInboundMessage"("fromPhone");

-- CreateIndex
CREATE INDEX "SmsInboundMessage_createdAt_idx" ON "SmsInboundMessage"("createdAt");
