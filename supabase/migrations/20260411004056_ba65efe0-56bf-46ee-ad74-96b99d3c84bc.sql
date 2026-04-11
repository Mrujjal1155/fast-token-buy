
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  brand_color text NOT NULL DEFAULT '#FFFFFF',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment_methods" ON public.payment_methods
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read visible payment_methods" ON public.payment_methods
  FOR SELECT TO public USING (is_visible = true);

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO public.payment_methods (name, sort_order, brand_color) VALUES
  ('bKash', 1, '#E2136E'),
  ('Nagad', 2, '#F6921E'),
  ('Rocket', 3, '#8C3494'),
  ('DBBL', 4, '#00A651'),
  ('Crypto', 5, '#F7931A');
