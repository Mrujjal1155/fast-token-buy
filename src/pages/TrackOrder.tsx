import { useState, useEffect, useCallback } from "react";
import { Search, Package, Clock, CheckCircle, AlertCircle, Copy, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const statusConfig: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  pending: { icon: Clock, label: "Pending", className: "text-yellow-400 bg-yellow-400/10" },
  processing: { icon: Loader2, label: "Processing", className: "text-blue-400 bg-blue-400/10" },
  completed: { icon: CheckCircle, label: "Completed", className: "text-primary bg-primary/10" },
  failed: { icon: AlertCircle, label: "Failed", className: "text-destructive bg-destructive/10" },
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

  // Realtime subscription for the tracked order
  useEffect(() => {
    if (!order) return;

    const channel = supabase
      .channel(`track-order-${order.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` },
        (payload) => {
          const updated = payload.new as Order;
          setOrder(updated);
          if (updated.status !== order.status) {
            toast({ title: "স্ট্যাটাস আপডেট!", description: `আপনার অর্ডার এখন: ${statusConfig[updated.status]?.label || updated.status}` });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [order?.id, order?.status]);

  const status = order ? statusConfig[order.status] : null;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="text-muted-foreground hover:text-foreground text-sm mb-6 block">
          ← Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/30 rounded-2xl p-8 shadow-card"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Track Your Order</h2>
            <p className="text-muted-foreground">Enter your Order ID or email address</p>
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Order ID or Email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-12 bg-secondary border-border/50"
            />
            <Button variant="hero" size="lg" onClick={() => handleSearch()} disabled={loading}>
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {searched && !order && (
            <div className="text-center py-6">
              <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No order found. Check your Order ID or email.</p>
            </div>
          )}

          {order && status && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Order</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-foreground">{order.order_id}</span>
                  <button onClick={() => { navigator.clipboard.writeText(order.order_id); toast({ title: "কপি হয়েছে!" }); }} className="p-1 rounded hover:bg-secondary transition"><Copy className="w-3.5 h-3.5 text-muted-foreground" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>
                  <status.icon className="w-4 h-4" />
                  {status.label}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Package</span>
                <span className="text-foreground">{order.credits} Credits</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-foreground">৳{order.amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-foreground text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TrackOrder;
