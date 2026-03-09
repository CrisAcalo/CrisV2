-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "isImportedFromLinkedIn" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "isImportedFromLinkedIn" BOOLEAN NOT NULL DEFAULT false;
