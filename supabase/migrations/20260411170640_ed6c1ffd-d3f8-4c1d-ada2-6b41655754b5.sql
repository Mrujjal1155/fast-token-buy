
-- Create proof_screenshots table
CREATE TABLE public.proof_screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.proof_screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visible proof screenshots"
  ON public.proof_screenshots FOR SELECT TO public
  USING (is_visible = true);

CREATE POLICY "Admins can manage proof screenshots"
  ON public.proof_screenshots FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for proof screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('proof-screenshots', 'proof-screenshots', true);

-- Storage policies
CREATE POLICY "Anyone can view proof screenshots"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'proof-screenshots');

CREATE POLICY "Admins can upload proof screenshots"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'proof-screenshots');

CREATE POLICY "Admins can delete proof screenshots"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'proof-screenshots');
