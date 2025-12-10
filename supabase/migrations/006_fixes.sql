-- =============================================================================
-- TAPSHOP: Bug Fixes Migration
-- Run this in Supabase SQL Editor
-- =============================================================================

-- =============================================================================
-- FIX 1: Rename customer_* columns to buyer_* in orders table
-- =============================================================================
DO $$
BEGIN
  -- Rename customer_name to buyer_name if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
    ALTER TABLE orders RENAME COLUMN customer_name TO buyer_name;
  END IF;

  -- Rename customer_phone to buyer_phone if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
    ALTER TABLE orders RENAME COLUMN customer_phone TO buyer_phone;
  END IF;

  -- Rename customer_address to buyer_address if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'orders' AND column_name = 'customer_address') THEN
    ALTER TABLE orders RENAME COLUMN customer_address TO buyer_address;
  END IF;

  -- Rename customer_lat to buyer_lat if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'orders' AND column_name = 'customer_lat') THEN
    ALTER TABLE orders RENAME COLUMN customer_lat TO buyer_lat;
  END IF;

  -- Rename customer_lng to buyer_lng if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'orders' AND column_name = 'customer_lng') THEN
    ALTER TABLE orders RENAME COLUMN customer_lng TO buyer_lng;
  END IF;

  -- Rename delivery_notes to buyer_notes if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'orders' AND column_name = 'delivery_notes') THEN
    ALTER TABLE orders RENAME COLUMN delivery_notes TO buyer_notes;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'orders' AND column_name = 'buyer_notes') THEN
    -- Add buyer_notes if neither exists
    ALTER TABLE orders ADD COLUMN buyer_notes TEXT;
  END IF;
END $$;

-- =============================================================================
-- FIX 2: Update order status CHECK constraint to include dispatched and failed
-- =============================================================================
DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

  -- Add new constraint with all statuses
  ALTER TABLE orders ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending', 'confirmed', 'shipping', 'dispatched', 'delivered', 'cancelled', 'failed'));
END $$;

-- =============================================================================
-- FIX 3: Add firebase_uid column to sellers table
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'sellers' AND column_name = 'firebase_uid') THEN
    ALTER TABLE sellers ADD COLUMN firebase_uid TEXT;
    CREATE INDEX IF NOT EXISTS idx_sellers_firebase_uid ON sellers(firebase_uid);
  END IF;
END $$;

-- =============================================================================
-- FIX 4: Create admin_settings table
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'admin',
  email TEXT,
  password_hash TEXT,
  session_token TEXT,
  session_expires TIMESTAMPTZ,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin row if not exists
INSERT INTO admin_settings (id, email)
VALUES ('admin', 'admin@tapshop.me')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Service role only access
CREATE POLICY IF NOT EXISTS admin_settings_service_access ON admin_settings
  FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- FIX 5: Add RLS policies for buyers and buyer_addresses tables
-- =============================================================================
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_addresses ENABLE ROW LEVEL SECURITY;

-- Service role full access
DROP POLICY IF EXISTS buyers_service_access ON buyers;
CREATE POLICY buyers_service_access ON buyers
  FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS buyer_addresses_service_access ON buyer_addresses;
CREATE POLICY buyer_addresses_service_access ON buyer_addresses
  FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- FIX 6: Create otp_rate_limits table for rate limiting
-- =============================================================================
CREATE TABLE IF NOT EXISTS otp_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('seller', 'buyer')),
  attempts INTEGER DEFAULT 1,
  last_attempt TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_rate_limits_phone ON otp_rate_limits(phone, type);

-- Enable RLS
ALTER TABLE otp_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS otp_rate_limits_service_access ON otp_rate_limits
  FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- FIX 7: Create atomic stock decrement function
-- =============================================================================
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock = stock - p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id
    AND stock >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock or product not found';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- DONE!
-- =============================================================================
