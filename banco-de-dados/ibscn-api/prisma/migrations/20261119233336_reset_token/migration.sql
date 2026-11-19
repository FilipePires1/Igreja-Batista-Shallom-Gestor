-- AlterTable
ALTER TABLE "User" ADD COLUMN "resetTokenExpiresAt" TEXT;
ALTER TABLE "User" ADD COLUMN "resetTokenHash" TEXT;
