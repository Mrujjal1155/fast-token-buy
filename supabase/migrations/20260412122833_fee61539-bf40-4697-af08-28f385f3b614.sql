
CREATE TABLE public.hero_floating_icons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  position_x NUMERIC NOT NULL DEFAULT 10,
  position_y NUMERIC NOT NULL DEFAULT 10,
  rotation NUMERIC NOT NULL DEFAULT 0,
  size INTEGER NOT NULL DEFAULT 60,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_floating_icons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible icons"
ON public.hero_floating_icons FOR SELECT
USING (true);

CREATE POLICY "Admins can insert icons"
ON public.hero_floating_icons FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update icons"
ON public.hero_floating_icons FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete icons"
ON public.hero_floating_icons FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_hero_floating_icons_updated_at
BEFORE UPDATE ON public.hero_floating_icons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
