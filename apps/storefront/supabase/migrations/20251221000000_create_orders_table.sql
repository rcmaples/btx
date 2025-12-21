-- Orders table for storing completed purchases
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,

  -- User info (nullable for guest checkout)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email TEXT,

  -- Shipping address
  shipping_street_address TEXT NOT NULL,
  shipping_street_address_2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL DEFAULT 'US',

  -- Line items stored as JSONB
  line_items JSONB NOT NULL,

  -- Pricing (all in cents)
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  shipping_cost INTEGER NOT NULL DEFAULT 500,
  total INTEGER NOT NULL,

  -- Promotion info (denormalized for history)
  applied_promotion JSONB,

  -- Stripe payment info
  stripe_payment_intent_id TEXT,
  stripe_payment_status TEXT,

  -- Order status
  status TEXT NOT NULL DEFAULT 'pending',
  is_test_order BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_guest_or_user CHECK (
    (user_id IS NOT NULL) OR (guest_email IS NOT NULL)
  ),
  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')
  )
);

-- Indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_guest_email ON orders(guest_email);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);

-- Note: RLS is intentionally disabled for orders table
-- Orders are created server-side via trusted Server Actions with validation
-- Table constraints ensure data integrity (user_id OR guest_email required)
-- If viewing orders from client-side is needed in the future, enable RLS with appropriate SELECT policies

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
