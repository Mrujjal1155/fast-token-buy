import { Shield, Zap, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  { icon: Zap, title: "Instant Delivery", desc: "Credits delivered in minutes" },
  { icon: Shield, title: "Secure Payment", desc: "100% safe transactions" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
];

const TrustBadges = () => {
  return (
    <section className="py-16 border-y border-border/30">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex items-center gap-4 justify-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <badge.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{badge.title}</h3>
                <p className="text-sm text-muted-foreground">{badge.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
