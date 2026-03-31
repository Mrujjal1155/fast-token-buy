import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, CheckCircle, Users, Clock, ShieldCheck, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Reserve {
  id: string;
  label: string;
  amount: string;
  icon: string;
  sort_order: number;
}

const iconMap: Record<string, React.ElementType> = {
  coins: Coins,
  "check-circle": CheckCircle,
  users: Users,
  clock: Clock,
  shield: ShieldCheck,
  trending: TrendingUp,
};

const colorMap: Record<string, string> = {
  coins: "#FF7A18",
  "check-circle": "#4D8DFF",
  users: "#FF3CAC",
  clock: "#7B61FF",
  shield: "#4D8DFF",
  trending: "#FF7A18",
};

const OurReserves = () => {
  const [reserves, setReserves] = useState<Reserve[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("reserves")
        .select("id, label, amount, icon, sort_order")
        .eq("is_visible", true)
        .order("sort_order");
      if (data) setReserves(data);
    };
    fetch();
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            কেন আমাদের <span className="text-gradient-primary">বিশ্বাস</span> করবেন?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">সংখ্যাই বলে দিচ্ছে — আমরা কথা রাখি</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          {reserves.map((r, i) => {
            const Icon = iconMap[r.icon] || Coins;
            const color = colorMap[r.icon] || "#FF7A18";
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass rounded-2xl p-5 md:p-6 text-center hover:shadow-glow transition-shadow duration-300"
              >
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-6 h-6 md:w-7 md:h-7" style={{ color }} />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{r.amount}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{r.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OurReserves;
