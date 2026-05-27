-- AlterTable
ALTER TABLE "users"
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "emailVerificationOtpHash" TEXT,
ADD COLUMN "emailVerificationOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN "passwordResetOtpHash" TEXT,
ADD COLUMN "passwordResetOtpExpiresAt" TIMESTAMP(3);
