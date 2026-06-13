
-- user_premium: remove self-write policies (server-only writes via service role)
DROP POLICY IF EXISTS "Insert own premium" ON public.user_premium;
DROP POLICY IF EXISTS "Update own premium" ON public.user_premium;

-- coupons: remove broad read + self-claim update policies
DROP POLICY IF EXISTS "Read unused or own coupons" ON public.coupons;
DROP POLICY IF EXISTS "Claim unused coupon" ON public.coupons;

-- Optional: allow users to read only coupons they have already redeemed
CREATE POLICY "Read own redeemed coupons"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (used_by = auth.uid());
