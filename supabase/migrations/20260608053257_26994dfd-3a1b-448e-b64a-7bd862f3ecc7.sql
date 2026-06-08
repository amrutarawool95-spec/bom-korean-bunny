
-- Coupons table: one row per code; redemption marks used_by = auth.uid()
CREATE TABLE public.coupons (
  code TEXT PRIMARY KEY,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Authenticated users can see only unused coupons (so they can verify a code) or coupons they used.
CREATE POLICY "Read unused or own coupons" ON public.coupons
  FOR SELECT TO authenticated
  USING (used_by IS NULL OR used_by = auth.uid());

-- Authenticated users can claim an unused coupon by setting used_by to themselves.
CREATE POLICY "Claim unused coupon" ON public.coupons
  FOR UPDATE TO authenticated
  USING (used_by IS NULL)
  WITH CHECK (used_by = auth.uid() AND used_at IS NOT NULL);

-- User premium table
CREATE TABLE public.user_premium (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium BOOLEAN NOT NULL DEFAULT true,
  granted_via TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.user_premium TO authenticated;
GRANT ALL ON public.user_premium TO service_role;

ALTER TABLE public.user_premium ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own premium" ON public.user_premium
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own premium" ON public.user_premium
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own premium" ON public.user_premium
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Seed coupons
INSERT INTO public.coupons (code) VALUES
('RKL9M'),('P4VTQ'),('CJXW2'),('L8ZGB'),('YND3F'),
('H7KSR'),('BQW5T'),('M1VPL'),('XGZ0N'),('D6FCH'),
('WTY8K'),('J2PXR'),('N5MBV'),('S9LDC'),('FQG4H'),
('T3JWM'),('V8CZX'),('K1RBQ'),('ZD7PN'),('C6XLT'),
('G2WJF'),('P9HVK'),('M4DBR'),('LSQ1Y'),('X3TNG'),
('B8FMC'),('R7VZW'),('K0PHD'),('J5WYB'),('NQ2TL');
