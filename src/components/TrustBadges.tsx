import { Shield, Zap, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";

const TrustBadges = () => {
  const { content } = useSiteContent();
  const c = content.trustBadges;

  const badges = [
    { icon: Zap, title: c.badge1Title, desc: c.badge1Desc, color: "#FF7A18" },
    { icon: Shield, title: c.badge2Title, desc: c.badge2Desc, color: "#7B61FF" },
    { icon: Headphones, title: c.badge3Title, desc: c.badge3Desc, color: "#4D8DFF" },
  ];

  return (
    <section className="py-10 md:py-16 border-y border-border/20">
      <div className="container px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          {badges.map((badge, i) => (
            <motion.div
              key={i}
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
                <badge.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: badge.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm md:text-base">{badge.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{badge.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
