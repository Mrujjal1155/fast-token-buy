import { useState, useEffect, useCallback } from "react";
import { Search, Package, Clock, CheckCircle, AlertCircle, Copy, Loader2, Timer } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { getDisplayStatus } from "@/lib/orderUtils";
import ReviewForm from "@/components/ReviewForm";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

type Order = Tables<"orders">;

const TrackOrder = () => {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t, lang } = useLanguage();

  const statusConfig: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    pending: { icon: Clock, label: t("status.pending"), className: "text-yellow-400 bg-yellow-400/10" },
    processing: { icon: Loader2, label: t("status.processing"), className: "text-blue-400 bg-blue-400/10" },
    completed: { icon: CheckCircle, label: t("status.completed"), className: "text-primary bg-primary/10" },
    failed: { icon: AlertCircle, label: t("status.failed"), className: "text-destructive bg-destructive/10" },
    timeout: { icon: Timer, label: t("status.timeout"), className: "text-orange-400 bg-orange-400/10" },
  };


  const handleSearch = useCallback(async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;
    setLoading(true);

    let { data } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", q)
      .maybeSingle();

    if (!data) {
      const res = await supabase
        .from("orders")
        .select("*")
        .eq("email", q.toLowerCase())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      data = res.data;
    }

    setOrder(data);
    setSearched(true);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    if (!order) return;

    const channel = supabase
      .channel(`track-order-${order.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` },
        (payload) => {
          setOrder(payload.new as Order);
          if ((payload.new as Order).status === "completed") {
            toast({ title: t("track.orderCompleted"), variant: "success" });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [order?.id]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setQuery(q);
      handleSearch(q);
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t("success.copied"), variant: "success" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Track Order — Lovable Credits"
        description="Track your Lovable credit order in real-time. Search by order ID or email."
        path="/track"
        keywords="order track, lovable credit order track, order status"
      />
      <Navbar />

      <div className="container max-w-xl px-4 pt-28 pb-16 md:pt-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">{t("track.heading")}</h1>
          <p className="text-muted-foreground">{t("track.subtext")}</p>
        </motion.div>

        <div className="flex gap-2 mb-8">
          <Input
            placeholder={t("track.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="glass border-border/30 focus-visible:ring-primary/50"
          />
          <Button onClick={() => handleSearch()} disabled={loading} className="shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {searched && !order && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 glass rounded-xl">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">{t("track.notFound")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("track.tryAgain")}</p>
          </motion.div>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("track.orderId")}</p>
                <button
                  onClick={() => copyToClipboard(order.order_id)}
                  className="flex items-center gap-1.5 font-mono text-sm text-foreground hover:text-primary transition"
                >
                  {order.order_id} <Copy className="w-3 h-3" />
                </button>
              </div>
              {(() => {
                const displayStatus = getDisplayStatus(order);
                const config = statusConfig[displayStatus];
                const Icon = config?.icon || Clock;
                return (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config?.className || ""}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {config?.label || order.status}
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: t("track.email"), value: order.email },
                { label: t("track.credits"), value: `${order.credits} ${t("pricing.credits")}` },
                { label: t("track.price"), value: `৳${order.amount}` },
                { label: t("track.payment"), value: order.payment_method },
                { label: t("track.transactionId"), value: order.transaction_id },
                { label: t("track.date"), value: new Date(order.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US") },
              ].map((item) => (
                <div key={item.label} className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{item.label}</p>
                  <p className="text-foreground font-medium truncate text-xs">{item.value}</p>
                </div>
              ))}
            </div>

            {order.status === "failed" && order.admin_notes?.includes("payment timeout") && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <Timer className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">{t("track.expiredTitle")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("track.expiredDesc")}</p>
                </div>
              </div>
            )}

            {order.status === "completed" && <ReviewForm orderId={order.order_id} />}

            <div className="text-center pt-2">
              <Link to="/" className="text-xs text-primary hover:underline">{t("track.backHome")}</Link>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TrackOrder;
