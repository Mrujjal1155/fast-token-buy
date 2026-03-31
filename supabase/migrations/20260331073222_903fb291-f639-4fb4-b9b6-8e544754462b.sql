
-- Create discount type enum
CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed');

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type discount_type NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL,
  min_amount NUMERIC DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons (for validation)
CREATE POLICY "Anyone can read active coupons" ON public.coupons
  FOR SELECT USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add coupon_code column to orders
ALTER TABLE public.orders ADD COLUMN coupon_code TEXT DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN discount_amount NUMERIC DEFAULT 0;

-- Function to validate and apply coupon atomically
CREATE OR REPLACE FUNCTION public.validate_coupon(p_code TEXT, p_amount NUMERIC)
RETURNS TABLE(valid BOOLEAN, discount_type discount_type, discount_value NUMERIC, calculated_discount NUMERIC, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
BEGIN
  SELECT * INTO v_coupon FROM public.coupons c
    WHERE c.code = upper(p_code) AND c.is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'percentage'::discount_type, 0::NUMERIC, 0::NUMERIC, 'Invalid coupon code'::TEXT;
    RETURN;
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    RETURN QUERY SELECT false, 'percentage'::discount_type, 0::NUMERIC, 0::NUMERIC, 'Coupon has expired'::TEXT;
    RETURN;
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN QUERY SELECT false, 'percentage'::discount_type, 0::NUMERIC, 0::NUMERIC, 'Coupon usage limit reached'::TEXT;
    RETURN;
  END IF;

  IF p_amount < v_coupon.min_amount THEN
    RETURN QUERY SELECT false, 'percentage'::discount_type, 0::NUMERIC, 0::NUMERIC, ('Minimum order amount is ৳' || v_coupon.min_amount)::TEXT;
    RETURN;
  END IF;

  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    RETURN QUERY SELECT true, v_coupon.discount_type, v_coupon.discount_value,
      LEAST(round(p_amount * v_coupon.discount_value / 100, 2), p_amount), 'Coupon applied!'::TEXT;
  ELSE
    RETURN QUERY SELECT true, v_coupon.discount_type, v_coupon.discount_value,
      LEAST(v_coupon.discount_value, p_amount), 'Coupon applied!'::TEXT;
  END IF;
END;
$$;

-- Function to increment coupon usage
CREATE OR REPLACE FUNCTION public.use_coupon(p_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons SET used_count = used_count + 1
    WHERE code = upper(p_code) AND is_active = true;
END;
$$;
