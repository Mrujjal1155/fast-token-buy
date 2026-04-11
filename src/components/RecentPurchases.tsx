import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Clock, CheckCircle, Loader2, AlertCircle, TrendingUp, Timer, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDisplayStatus } from "@/lib/orderUtils";

type Order = Tables<"orders">;

const maskEmail = (email: string) => {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return user.slice(0, 2) + "***@" + domain;
};

const RecentPurchases = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string; bgColor: string; pulse?: boolean }> = {
    pending: { icon: Clock, label: t("status.pending"), color: "text-yellow-400", bgColor: "bg-yellow-400/10", pulse: true },
    processing: { icon: Loader2, label: t("status.processing"), color: "text-blue-400", bgColor: "bg-blue-400/10", pulse: true },
    completed: { icon: CheckCircle, label: t("status.completed"), color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
    failed: { icon: AlertCircle, label: t("status.failed"), color: "text-red-400", bgColor: "bg-red-400/10" },
    timeout: { icon: Timer, label: t("status.timeout"), color: "text-orange-400", bgColor: "bg-orange-400/10" },
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(25);
      if (data) setOrders(data);
      setLoading(false);
    };
    fetchOrders();

    const channel = supabase
      .channel("recent-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new as Order, ...prev].slice(0, 25));
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o))
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading || orders.length === 0) return null;

  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#FF3CAC]/6 blur-[140px] pointer-events-none animate-hero-blob-1" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[200px] bg-[#7B61FF]/5 blur-[100px] pointer-events-none animate-hero-blob-2" />

      <div className="container px-4 relative z-10">
        {/* Header with live pulse */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4 relative"
          >
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping" />
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">{t("recent.liveBadge")}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3"
          >
            {t("recent.heading")} <span className="text-gradient-primary">{t("recent.headingHighlight")}</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-[#FF7A18] animate-pulse" />
            <p className="text-muted-foreground text-sm md:text-base">{t("recent.subtext")}</p>
          </motion.div>

          {/* Order count badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF7A18]/10 to-[#FF3CAC]/10 border border-[#FF7A18]/20"
          >
            <Package className="w-3.5 h-3.5 text-[#FF7A18]" />
            <span className="text-xs font-medium text-[#FF7A18]">{orders.length} recent orders</span>
          </motion.div>
        </div>

        {/* Order list */}
        <div className="max-w-2xl mx-auto space-y-2.5">
          <AnimatePresence initial={false}>
            {orders.map((order, index) => {
              const displayStatus = getDisplayStatus(order);
              const st = statusConfig[displayStatus] || statusConfig.pending;
              const StatusIcon = st.icon;
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.95 }}
                  transition={{ delay: index * 0.03, type: "spring", stiffness: 300, damping: 25 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative flex items-center justify-between gap-2 md:gap-3 glass rounded-xl px-3 md:px-4 py-3 md:py-3.5 transition-all duration-300"
                >
                  {/* Left glow on hover */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-8 rounded-full bg-gradient-to-b from-[#FF7A18] to-[#FF3CAC] transition-all duration-300" />

                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#7B61FF]/10 flex items-center justify-center shrink-0">
                      {st.pulse && (
                        <span className="absolute inset-0 rounded-full bg-[#7B61FF]/20 animate-ping" />
                      )}
                      <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#7B61FF]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-medium text-foreground truncate">
                        {maskEmail(order.email)} — <span className="text-gradient-primary font-semibold">{order.credits}</span> {t("recent.tookCredits")}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground font-mono truncate">{order.order_id}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1 md:gap-1.5 shrink-0 px-2.5 py-1 rounded-full ${st.color} ${st.bgColor} ${st.pulse ? "animate-pulse" : ""}`}>
                    <StatusIcon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${displayStatus === "processing" ? "animate-spin" : ""}`} />
                    <span className="text-[10px] md:text-xs font-medium whitespace-nowrap">{st.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default RecentPurchases;
