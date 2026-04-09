import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CreditPackage } from "@/lib/packages";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  buildPackageSavingsFallback,
  getPackageSavingsText,
  loadPackageTextMaps,
} from "@/lib/catalogLocalization";

export const usePackages = () => {
  const { lang } = useLanguage();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetch = async () => {
      setLoading(true);

      const [{ data }, textMaps] = await Promise.all([
        supabase
          .from("packages")
          .select("package_key, credits, price, currency, popular, savings, sort_order, stock")
          .eq("is_active", true)
          .order("sort_order"),
        loadPackageTextMaps(),
      ]);

      if (ignore) return;

      if (data) {
        const localizedPackages = data.map((pkg: any) => {
          const fallbackSavings = buildPackageSavingsFallback({
            value: pkg.savings,
            lang,
            popular: pkg.popular,
          });

          return {
            id: pkg.package_key,
            credits: pkg.credits,
            price: Number(pkg.price),
            currency: pkg.currency,
            popular: pkg.popular,
            savings: getPackageSavingsText(textMaps[lang], pkg.package_key, fallbackSavings) || undefined,
            stock: pkg.stock,
          };
        });

        setPackages(localizedPackages);
      } else {
        setPackages([]);
      }

      setLoading(false);
    };

    fetch();

    return () => {
      ignore = true;
    };
  }, [lang]);

  return { packages, loading };
};
