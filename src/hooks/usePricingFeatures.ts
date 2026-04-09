import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export const usePricingFeatures = (packageKey?: string) => {
  const { lang } = useLanguage();
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    const fetch = async () => {
      let query = supabase
        .from("pricing_features")
        .select("text_en, text_bn, package_key")
        .eq("is_visible", true)
        .order("sort_order");

      const { data } = await query;
      if (data) {
        // Filter: show features matching this package_key OR global (null)
        const filtered = (data as any[]).filter(
          (f) => f.package_key === null || f.package_key === packageKey
        );
        setFeatures(filtered.map((f) => (lang === "bn" ? f.text_bn : f.text_en)));
      }
    };
    fetch();
  }, [lang, packageKey]);

  return features;
};
