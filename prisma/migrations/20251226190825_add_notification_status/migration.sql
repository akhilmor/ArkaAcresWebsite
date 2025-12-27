-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "emailError" TEXT;
ALTER TABLE "Booking" ADD COLUMN "emailSentAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "emailStatus" TEXT DEFAULT 'not_sent';
ALTER TABLE "Booking" ADD COLUMN "smsError" TEXT;
ALTER TABLE "Booking" ADD COLUMN "smsSentAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "smsStatus" TEXT DEFAULT 'not_sent';
