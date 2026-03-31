
CREATE TABLE public.packages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_key text NOT NULL UNIQUE,
  credits integer NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'BDT',
  popular boolean NOT NULL DEFAULT false,
  savings text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage packages" ON public.packages
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read active packages" ON public.packages
  FOR SELECT TO public
  USING (is_active = true);

INSERT INTO public.packages (package_key, credits, price, currency, popular, savings, sort_order)
VALUES
  ('pkg-50', 50, 40, 'BDT', false, 'শুরু করুন এখানে', 0),
  ('pkg-105', 105, 80, 'BDT', true, '২৪% সাশ্রয় — সেরা ডিল!', 1),
  ('pkg-300', 300, 200, 'BDT', false, '৩৩% সাশ্রয় — ম্যাক্স ভ্যালু!', 2);
