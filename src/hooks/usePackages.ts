import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CreditPackage } from "@/lib/packages";

export const usePackages = () => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("packages")
        .select("package_key, credits, price, currency, popular, savings, sort_order")
        .eq("is_active", true)
        .order("sort_order");

      if (data) {
        setPackages(
          data.map((d: any) => ({
            id: d.package_key,
            credits: d.credits,
            price: Number(d.price),
            currency: d.currency,
            popular: d.popular,
            savings: d.savings || undefined,
          }))
        );
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { packages, loading };
};
