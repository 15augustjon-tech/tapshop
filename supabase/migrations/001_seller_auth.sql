-- =============================================================================
-- TAPSHOP: Seller Authentication Tables
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/nhlxqwnqfmhdhnccspjn/sql
-- =============================================================================

-- =============================================================================
-- TABLE: otp_codes
-- Purpose: Store OTP codes for phone verification
-- =============================================================================
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('seller', 'buyer')),
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for looking up OTPs by phone
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone, type);

-- Index for cleanup of expired OTPs
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);

-- =============================================================================
-- TABLE: sellers
-- Purpose: Store seller accounts and shop information
-- =============================================================================
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  shop_name TEXT,
  shop_slug TEXT UNIQUE,
  promptpay_id TEXT,
  pickup_address TEXT,
  pickup_lat DECIMAL(10,8),
  pickup_lng DECIMAL(11,8),
  line_user_id TEXT,
  shipping_days INTEGER[] DEFAULT '{1,2,3,4,5}',
  shipping_time TEXT DEFAULT '14:00',
  is_active BOOLEAN DEFAULT TRUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for phone lookup (login)
CREATE INDEX IF NOT EXISTS idx_sellers_phone ON sellers(phone);

-- Index for shop URL lookup
CREATE INDEX IF NOT EXISTS idx_sellers_shop_slug ON sellers(shop_slug);

-- =============================================================================
-- FUNCTION: Update timestamp on row update
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sellers table
DROP TRIGGER IF EXISTS update_sellers_updated_at ON sellers;
CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON sellers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNCTION: Clean up expired OTPs (run periodically or on each request)
-- =============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on both tables
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- OTP codes: Only service role can access (API routes use service role)
CREATE POLICY otp_service_only ON otp_codes
  FOR ALL
  USING (auth.role() = 'service_role');

-- Sellers: Service role has full access
CREATE POLICY sellers_service_access ON sellers
  FOR ALL
  USING (auth.role() = 'service_role');

-- Sellers: Anon can read active seller public info (for shop pages)
CREATE POLICY sellers_public_read ON sellers
  FOR SELECT
  USING (is_active = TRUE AND onboarding_completed = TRUE);

-- =============================================================================
-- DONE!
-- Now test by inserting a test OTP:
-- INSERT INTO otp_codes (phone, code, type, expires_at)
-- VALUES ('+66812345678', '123456', 'seller', NOW() + INTERVAL '5 minutes');
-- =============================================================================
