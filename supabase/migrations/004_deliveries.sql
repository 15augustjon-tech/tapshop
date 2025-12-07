-- =============================================
-- Migration: 004_deliveries.sql
-- Description: Deliveries table for Lalamove integration
-- =============================================

-- Deliveries table to track delivery status and driver info
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Lalamove integration
  lalamove_order_id VARCHAR(100),
  lalamove_share_link TEXT,

  -- Status: booked, assigned, picked_up, delivered, cancelled, failed, expired
  status VARCHAR(50) DEFAULT 'booked',

  -- Driver info (populated from Lalamove webhook)
  driver_name VARCHAR(100),
  driver_phone VARCHAR(20),
  driver_plate VARCHAR(20),

  -- Fees
  delivery_fee DECIMAL(10, 2),
  cod_amount DECIMAL(10, 2),

  -- Timestamps
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_lalamove_order_id ON deliveries(lalamove_order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

-- Add pickup_address to sellers if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sellers' AND column_name = 'pickup_address'
  ) THEN
    ALTER TABLE sellers ADD COLUMN pickup_address TEXT;
  END IF;
END $$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_deliveries_updated_at()
RETURNS TRIGGER AS $body$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$body$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_deliveries_updated_at ON deliveries;
CREATE TRIGGER trigger_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_deliveries_updated_at();

-- RLS Policies
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Service role has full access
DROP POLICY IF EXISTS deliveries_service_access ON deliveries;
CREATE POLICY deliveries_service_access ON deliveries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
