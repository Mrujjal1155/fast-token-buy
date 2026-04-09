import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, TrendingUp, AlertTriangle, PackageCheck, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useLanguage } from "@/contexts/LanguageContext";

interface PackageReserve {
  id: string;
  package_key: string;
  credits: number;
  price: number;
  stock: number | null;
  popular: boolean;
}

const OurReserves = () => {
  const [reserves, setReserves] = useState<PackageReserve[]>([]);
  const { content } = useSiteContent();
  const c = content.reserves;
  const { t } = useLanguage();

  useEffect(() => {
    let ignore = false;

    const fetch = async () => {
      const { data } = await supabase
        .from("packages")
        .select("id, package_key, credits, price, stock, popular")
        .eq("is_active", true)
        .order("sort_order");

      if (ignore) return;

      if (data) {
        setReserves(data as PackageReserve[]);
      } else {
        setReserves([]);
      }
    };

    fetch();

    return () => {
      ignore = true;
    };
  }, []);

  if (reserves.length === 0) return null;

  return (
    <section className="py-16 md:py-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-[#FF7A18]/5 blur-[140px] pointer-events-none" />

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">{c.badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            {c.heading} <span className="text-gradient-primary">{c.headingHighlight}</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">{c.subtext}</p>
        </motion.div>

        <div className={`grid grid-cols-1 ${reserves.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-4 md:gap-6 max-w-3xl mx-auto`}>
          {reserves.map((pkg, i) => {
            const stock = pkg.stock;
            const isUnlimited = stock == null;
            const isOutOfStock = !isUnlimited && stock <= 0;
            const isLowStock = !isUnlimited && !isOutOfStock && stock <= 5;
            const stockDisplay = isUnlimited ? "∞" : String(stock);

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                whileHover={!isOutOfStock ? { y: -6, transition: { duration: 0.2 } } : {}}
                className={`glass rounded-2xl p-5 md:p-6 text-center transition-shadow duration-300 relative overflow-hidden ${isOutOfStock ? "opacity-60 grayscale" : "hover:shadow-glow"}`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-[10px] font-bold uppercase tracking-wide border border-destructive/20">
                      <XCircle className="w-3 h-3" /> {t("reserves.outOfStock")}
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 text-[10px] font-bold uppercase tracking-wide border border-yellow-500/20 animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> {t("reserves.sellingFast")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wide border border-emerald-500/20">
                      <PackageCheck className="w-3 h-3" /> In Stock
                    </span>
                  )}
                </div>

                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 mt-4 ${isOutOfStock ? "bg-muted" : "bg-primary/10"}`}>
                  <Package className={`w-6 h-6 md:w-7 md:h-7 ${isOutOfStock ? "text-muted-foreground" : "text-primary"}`} />
                </div>
                <p className="text-lg md:text-xl font-bold text-foreground mb-1">
                  {pkg.credits} {t("pricing.credits")}
                </p>
                <p className="text-xs text-muted-foreground mb-2">৳{pkg.price}</p>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className={`text-3xl md:text-4xl font-bold ${isOutOfStock ? "text-destructive" : "text-gradient-primary"}`}>
                    {isOutOfStock ? "0" : stockDisplay}
                  </span>
                </div>
                <p className={`text-xs md:text-sm ${isOutOfStock ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                  {isOutOfStock ? t("reserves.noStock") : isUnlimited ? t("reserves.available") : `${stock} ${t("reserves.available")}`}
                </p>
                <div className="mt-3 w-full h-1.5 rounded-full bg-border/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOutOfStock
                        ? "bg-destructive"
                        : isLowStock
                        ? "bg-yellow-400 animate-pulse"
                        : "bg-emerald-400"
                    }`}
                    style={{
                      width: isOutOfStock
                        ? "0%"
                        : isUnlimited
                        ? "100%"
                        : `${Math.min(Math.max((stock / 100) * 100, 15), 100)}%`,
                    }}
                  />
                </div>
                {isLowStock && (
                  <p className="text-[10px] text-yellow-400 font-medium mt-2 animate-pulse">
                    {t("reserves.sellingFast")}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OurReserves;
