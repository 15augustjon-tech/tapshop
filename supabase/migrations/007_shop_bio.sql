-- =============================================================================
-- TAPSHOP: Add shop_bio to sellers
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Add shop_bio column for shop description/bio
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'sellers' AND column_name = 'shop_bio') THEN
    ALTER TABLE sellers ADD COLUMN shop_bio TEXT;
  END IF;
END $$;

-- =============================================================================
-- DONE!
-- =============================================================================
