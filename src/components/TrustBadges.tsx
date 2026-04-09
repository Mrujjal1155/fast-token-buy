import { Shield, Zap, Headphones, Star, Heart, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const iconMap: Record<string, React.ComponentType<any>> = {
  zap: Zap, shield: Shield, headphones: Headphones, star: Star, heart: Heart, award: Award,
};

interface Badge {
  id: string;
  icon: string;
  title_en: string;
  title_bn: string;
  desc_en: string;
  desc_bn: string;
  color: string;
  sort_order: number;
}

const TrustBadges = () => {
  const { lang } = useLanguage();
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("trust_badges").select("*").eq("is_visible", true).order("sort_order");
      if (data) setBadges(data as Badge[]);
    };
    fetch();
  }, []);

  if (badges.length === 0) return null;

  return (
    <section className="py-10 md:py-16 border-y border-border/20">
      <div className="container px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          {badges.map((badge, i) => {
            const IconComp = iconMap[badge.icon] || Zap;
            const title = lang === "bn" ? badge.title_bn : badge.title_en;
            const desc = lang === "bn" ? badge.desc_bn : badge.desc_en;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="flex items-center gap-4 justify-center sm:justify-center glass rounded-xl px-4 py-4"
              >
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${badge.color}15` }}
                >
                  <IconComp className="w-5 h-5 md:w-6 md:h-6" style={{ color: badge.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base">{title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
