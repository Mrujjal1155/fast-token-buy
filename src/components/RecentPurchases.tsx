import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const statusConfig: Record<string, { icon: typeof Clock; label: string; className: string }> = {
  pending: { icon: Clock, label: "Pending", className: "text-yellow-500" },
  processing: { icon: Loader2, label: "Processing", className: "text-blue-400" },
  completed: { icon: CheckCircle, label: "Completed", className: "text-emerald-500" },
  failed: { icon: AlertCircle, label: "Failed", className: "text-red-500" },
};

const maskEmail = (email: string) => {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return user.slice(0, 2) + "***@" + domain;
};

const RecentPurchases = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

    // Realtime subscription
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
    <section className="py-16 bg-secondary/20">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            সাম্প্রতিক <span className="text-gradient-primary">অর্ডারসমূহ</span>
          </h2>
          <p className="text-muted-foreground">রিয়েলটাইম অর্ডার আপডেট</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-2">
          <AnimatePresence initial={false}>
            {orders.map((order) => {
              const st = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = st.icon;
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center justify-between gap-3 bg-card border border-border/20 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {maskEmail(order.email)} — {order.credits} Credits
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{order.order_id}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 shrink-0 ${st.className}`}>
                    <StatusIcon className={`w-4 h-4 ${order.status === "processing" ? "animate-spin" : ""}`} />
                    <span className="text-xs font-medium">{st.label}</span>
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
