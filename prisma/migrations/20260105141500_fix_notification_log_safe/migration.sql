-- Safe migration: Create NotificationLog table if it doesn't exist
-- This handles the case where the previous migration partially succeeded

-- Check if table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'NotificationLog'
    ) THEN
        -- CreateTable
        CREATE TABLE "NotificationLog" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "bookingId" TEXT NOT NULL,
            "audience" TEXT NOT NULL,
            "channel" TEXT NOT NULL,
            "messageType" TEXT NOT NULL,
            "status" TEXT NOT NULL,
            "provider" TEXT NOT NULL,
            "providerMessageId" TEXT,
            "errorMessage" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "NotificationLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
    END IF;
END $$;

-- CreateIndex: NotificationLog_bookingId_idx
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'NotificationLog' 
        AND indexname = 'NotificationLog_bookingId_idx'
    ) THEN
        CREATE INDEX "NotificationLog_bookingId_idx" ON "NotificationLog"("bookingId");
    END IF;
END $$;

-- CreateIndex: NotificationLog_audience_channel_messageType_idx
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'NotificationLog' 
        AND indexname = 'NotificationLog_audience_channel_messageType_idx'
    ) THEN
        CREATE INDEX "NotificationLog_audience_channel_messageType_idx" ON "NotificationLog"("audience", "channel", "messageType");
    END IF;
END $$;

-- CreateIndex: NotificationLog_bookingId_audience_channel_messageType_status_idx
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'NotificationLog' 
        AND indexname = 'NotificationLog_bookingId_audience_channel_messageType_status_idx'
    ) THEN
        CREATE INDEX "NotificationLog_bookingId_audience_channel_messageType_status_idx" ON "NotificationLog"("bookingId", "audience", "channel", "messageType", "status");
    END IF;
END $$;

