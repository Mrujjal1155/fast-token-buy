
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-icons', 'payment-icons', true);

CREATE POLICY "Anyone can view payment icons"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'payment-icons');

CREATE POLICY "Admins can upload payment icons"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-icons' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update payment icons"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'payment-icons' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete payment icons"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'payment-icons' AND public.has_role(auth.uid(), 'admin'::public.app_role));
