-- =============================================
-- Migration: 003_buyers.sql
-- Description: Buyers and buyer addresses tables
-- =============================================

-- Buyers table
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buyer saved addresses
CREATE TABLE IF NOT EXISTS buyer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  label VARCHAR(50) DEFAULT 'ที่อยู่จัดส่ง',
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  notes TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_buyers_phone ON buyers(phone);
CREATE INDEX IF NOT EXISTS idx_buyer_addresses_buyer_id ON buyer_addresses(buyer_id);

-- Update orders table to reference buyers
-- Note: This assumes orders table already exists from migration 002
-- If buyer_id column doesn't exist, add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'buyer_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN buyer_id UUID REFERENCES buyers(id);
    CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
  END IF;
END $$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_buyers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_buyers_updated_at ON buyers;
CREATE TRIGGER trigger_buyers_updated_at
  BEFORE UPDATE ON buyers
  FOR EACH ROW
  EXECUTE FUNCTION update_buyers_updated_at();
