
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active notifications"
  ON public.notifications FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.notifications (title, message) VALUES
  ('স্বাগতম!', 'সীমিত সময়ের জন্য সকল প্যাকেজে বিশেষ ছাড় চলছে। এখনই অর্ডার করুন!');
