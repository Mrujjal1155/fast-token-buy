
CREATE TABLE public.reserves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  amount text NOT NULL,
  icon text NOT NULL DEFAULT 'coins',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.reserves ENABLE ROW LEVEL SECURITY;

-- Anyone can read visible reserves
CREATE POLICY "Anyone can read visible reserves"
  ON public.reserves FOR SELECT TO public
  USING (is_visible = true);

-- Admins can manage reserves
CREATE POLICY "Admins can manage reserves"
  ON public.reserves FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default reserves data
INSERT INTO public.reserves (label, amount, icon, sort_order) VALUES
  ('মোট ক্রেডিট স্টক', '৫০,০০০+', 'coins', 1),
  ('সফল ডেলিভারি', '১,২০০+', 'check-circle', 2),
  ('সক্রিয় গ্রাহক', '৫০০+', 'users', 3),
  ('গড় ডেলিভারি সময়', '৫ মিনিট', 'clock', 4);
