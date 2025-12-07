-- =============================================
-- Migration: 005_line_notifications.sql
-- Description: Add LINE user ID to sellers for notifications
-- Run this in Supabase SQL Editor
-- =============================================

-- Add line_user_id to sellers if not exists
DO $body$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sellers' AND column_name = 'line_user_id'
  ) THEN
    ALTER TABLE sellers ADD COLUMN line_user_id VARCHAR(100);
  END IF;
END $body$;

-- Add last_reminder_sent to sellers for tracking reminders
DO $body$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sellers' AND column_name = 'last_reminder_sent'
  ) THEN
    ALTER TABLE sellers ADD COLUMN last_reminder_sent TIMESTAMPTZ;
  END IF;
END $body$;

-- Index for finding sellers with LINE configured
CREATE INDEX IF NOT EXISTS idx_sellers_line_user_id ON sellers(line_user_id) WHERE line_user_id IS NOT NULL;
