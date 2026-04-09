
-- Trust badges table
CREATE TABLE public.trust_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon TEXT NOT NULL DEFAULT 'zap',
  title_en TEXT NOT NULL DEFAULT '',
  title_bn TEXT NOT NULL DEFAULT '',
  desc_en TEXT NOT NULL DEFAULT '',
  desc_bn TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#FF7A18',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trust_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage trust_badges" ON public.trust_badges FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can read visible trust_badges" ON public.trust_badges FOR SELECT TO public USING (is_visible = true);

-- Pricing features table
CREATE TABLE public.pricing_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text_en TEXT NOT NULL DEFAULT '',
  text_bn TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pricing_features" ON public.pricing_features FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can read visible pricing_features" ON public.pricing_features FOR SELECT TO public USING (is_visible = true);

-- Seed default trust badges
INSERT INTO public.trust_badges (icon, title_en, title_bn, desc_en, desc_bn, color, sort_order) VALUES
  ('zap', '5-Min Delivery', '৫ মিনিটে ডেলিভারি', 'Order now, get it in minutes — guaranteed!', 'অর্ডার দিন, মিনিটে পান — গ্যারান্টি!', '#FF7A18', 1),
  ('shield', '100% Secure', '১০০% নিরাপদ', 'Your money & data are fully protected', 'আপনার টাকা ও তথ্য সম্পূর্ণ সুরক্ষিত', '#7B61FF', 2),
  ('headphones', '24/7 Live Support', '২৪/৭ লাইভ সাপোর্ট', 'We''re always here to help you', 'যেকোনো সমস্যায় আমরা পাশে আছি', '#4D8DFF', 3);

-- Seed default pricing features
INSERT INTO public.pricing_features (text_en, text_bn, sort_order) VALUES
  ('5-minute delivery guarantee', '৫ মিনিটে ডেলিভারি গ্যারান্টি', 1),
  ('24/7 live support', '২৪/৭ লাইভ সাপোর্ট', 2),
  ('100% secure payment', '১০০% নিরাপদ পেমেন্ট', 3);
