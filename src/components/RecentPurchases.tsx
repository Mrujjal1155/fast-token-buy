import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Clock, CheckCircle, Loader2, AlertCircle, TrendingUp, Timer } from "lucide-react";
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

  const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string; bgColor: string }> = {
    pending: { icon: Clock, label: t("status.pending"), color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
    processing: { icon: Loader2, label: t("status.processing"), color: "text-blue-400", bgColor: "bg-blue-400/10" },
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
    <section className="py-10 md:py-16 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#FF3CAC]/5 blur-[120px] pointer-events-none" />

      <div className="container px-4 relative z-10">
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4 animate-pulse-glow">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">{t("recent.liveBadge")}</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
            {t("recent.heading")} <span className="text-gradient-primary">{t("recent.headingHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">{t("recent.subtext")}</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-2">
          <AnimatePresence initial={false}>
            {orders.map((order) => {
              const displayStatus = getDisplayStatus(order);
              const st = statusConfig[displayStatus] || statusConfig.pending;
              const StatusIcon = st.icon;
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center justify-between gap-2 md:gap-3 glass rounded-xl px-3 md:px-4 py-2.5 md:py-3 transition-all duration-300 hover:border-border/40"
                >
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#7B61FF]/10 flex items-center justify-center shrink-0">
                      <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#7B61FF]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-medium text-foreground truncate">
                        {maskEmail(order.email)} — {order.credits} {t("recent.tookCredits")}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground font-mono truncate">{order.order_id}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 md:gap-1.5 shrink-0 px-2.5 py-1 rounded-full ${st.color} ${st.bgColor}`}>
                    <StatusIcon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${order.status === "processing" ? "animate-spin" : ""}`} />
                    <span className="text-[10px] md:text-xs font-medium">{st.label}</span>
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
