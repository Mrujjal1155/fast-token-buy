import { useState, useEffect, useCallback } from "react";
import { Search, Package, Clock, CheckCircle, AlertCircle, Copy, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import ReviewForm from "@/components/ReviewForm";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Order = Tables<"orders">;

const statusConfig: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  pending: { icon: Clock, label: "অপেক্ষমাণ", className: "text-yellow-400 bg-yellow-400/10" },
  processing: { icon: Loader2, label: "প্রক্রিয়াধীন", className: "text-blue-400 bg-blue-400/10" },
  completed: { icon: CheckCircle, label: "সম্পন্ন", className: "text-primary bg-primary/10" },
  failed: { icon: AlertCircle, label: "ব্যর্থ", className: "text-destructive bg-destructive/10" },
};

const TrackOrder = () => {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

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
            toast({ title: "🎉 আপনার অর্ডার সম্পন্ন হয়েছে!", variant: "success" });
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
    toast({ title: "কপি হয়েছে!", variant: "success" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="অর্ডার ট্র্যাক করুন — Lovable Credits"
        description="আপনার Lovable ক্রেডিট অর্ডারের রিয়েল-টাইম স্ট্যাটাস ট্র্যাক করুন। অর্ডার আইডি বা ইমেইল দিয়ে খুঁজুন।"
        path="/track"
        keywords="order track, lovable credit order track, অর্ডার ট্র্যাক, lovable order status"
      />
      <Navbar />

      <div className="container max-w-xl px-4 pt-28 pb-16 md:pt-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">অর্ডার ট্র্যাক</h1>
          <p className="text-muted-foreground">অর্ডার আইডি বা ইমেইল দিয়ে খুঁজুন</p>
        </motion.div>

        <div className="flex gap-2 mb-8">
          <Input
            placeholder="ORD-XXXXXXXX বা email"
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
            <p className="text-muted-foreground">কোনো অর্ডার পাওয়া যায়নি</p>
            <p className="text-xs text-muted-foreground mt-1">আইডি বা ইমেইল চেক করে আবার চেষ্টা করুন</p>
          </motion.div>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-5 md:p-6 space-y-5">
            {/* Status header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">অর্ডার আইডি</p>
                <button
                  onClick={() => copyToClipboard(order.order_id)}
                  className="flex items-center gap-1.5 font-mono text-sm text-foreground hover:text-primary transition"
                >
                  {order.order_id} <Copy className="w-3 h-3" />
                </button>
              </div>
              {(() => {
                const config = statusConfig[order.status];
                const Icon = config?.icon || Clock;
                return (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config?.className || ""}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {config?.label || order.status}
                  </div>
                );
              })()}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "ইমেইল", value: order.email },
                { label: "ক্রেডিট", value: `${order.credits} Credits` },
                { label: "মূল্য", value: `৳${order.amount}` },
                { label: "পেমেন্ট", value: order.payment_method },
                { label: "ট্রানজেকশন আইডি", value: order.transaction_id },
                { label: "তারিখ", value: new Date(order.created_at).toLocaleDateString("bn-BD") },
              ].map((item) => (
                <div key={item.label} className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{item.label}</p>
                  <p className="text-foreground font-medium truncate text-xs">{item.value}</p>
                </div>
              ))}
            </div>

            {order.status === "completed" && <ReviewForm orderId={order.order_id} />}

            {/* Back link */}
            <div className="text-center pt-2">
              <Link to="/" className="text-xs text-primary hover:underline">← হোমে ফিরুন</Link>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TrackOrder;
