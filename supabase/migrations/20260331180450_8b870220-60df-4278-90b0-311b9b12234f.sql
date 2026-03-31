CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.site_settings (key, value) VALUES ('operator_status', 'online');