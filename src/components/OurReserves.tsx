import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Reserve {
  id: string;
  label: string;
  amount: string;
  icon: string;
  sort_order: number;
}

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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">লাইভ স্টক আপডেট</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            আমাদের <span className="text-gradient-primary">স্টক রিজার্ভ</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">প্রতিটি প্যাকেজে পর্যাপ্ত স্টক — দেরি না করে অর্ডার করুন!</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
          {reserves.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass rounded-2xl p-5 md:p-6 text-center hover:shadow-glow transition-shadow duration-300 relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 bg-primary/10">
                <Package className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>

              <p className="text-lg md:text-xl font-bold text-foreground mb-1">{r.label}</p>

              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="text-3xl md:text-4xl font-bold text-gradient-primary">{r.amount}</span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">প্যাকেজ এভেইলেবল</p>

              {/* Stock indicator bar */}
              <div className="mt-3 w-full h-1.5 rounded-full bg-border/30 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400 animate-pulse" style={{ width: `${Math.min(Number(r.amount) > 0 ? 70 + Math.random() * 30 : 0, 100)}%` }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurReserves;
