import { Shield, Zap, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  { icon: Zap, title: "Instant Delivery", desc: "Credits delivered in minutes" },
  { icon: Shield, title: "Secure Payment", desc: "100% safe transactions" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
];

const TrustBadges = () => {
  return (
    <section className="py-10 md:py-16 border-y border-border/30">
      <div className="container px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex items-center gap-4 justify-center sm:justify-center"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <badge.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
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
