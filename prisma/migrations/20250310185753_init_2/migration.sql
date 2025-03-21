-- CreateTable
CREATE TABLE "AuthAttempt" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "eventType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuthAttempt_identifier_success_createdAt_idx" ON "AuthAttempt"("identifier", "success", "createdAt");

-- CreateIndex
CREATE INDEX "AuthAttempt_ipAddress_success_createdAt_idx" ON "AuthAttempt"("ipAddress", "success", "createdAt");
