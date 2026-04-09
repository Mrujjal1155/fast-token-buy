
ALTER TABLE public.pricing_features
ADD COLUMN package_key text DEFAULT NULL;

-- Index for faster lookups
CREATE INDEX idx_pricing_features_package_key ON public.pricing_features(package_key);
