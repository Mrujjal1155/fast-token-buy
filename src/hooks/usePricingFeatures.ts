import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export const usePricingFeatures = () => {
  const { lang } = useLanguage();
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("pricing_features")
        .select("text_en, text_bn")
        .eq("is_visible", true)
        .order("sort_order");
      if (data) {
        setFeatures(data.map((f: any) => (lang === "bn" ? f.text_bn : f.text_en)));
      }
    };
    fetch();
  }, [lang]);

  return features;
};
