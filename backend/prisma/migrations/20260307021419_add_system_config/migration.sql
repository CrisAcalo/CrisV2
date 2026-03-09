-- CreateTable
CREATE TABLE "SystemConfiguration" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "linkedInUrn" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfiguration_pkey" PRIMARY KEY ("id")
);
