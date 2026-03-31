import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || "";
  const transactionId = searchParams.get("transactionId") || "";
  const status = searchParams.get("status") || "";
  const [verifying, setVerifying] = useState(false);

  // Auto-verify AjkerPay payment if transactionId present
  useEffect(() => {
    if (transactionId && orderId) {
      const verify = async () => {
        setVerifying(true);
        await supabase.functions.invoke("verify-ajkerpay-payment", {
          body: { transaction_id: transactionId, order_id: orderId },
        });
        setVerifying(false);
      };
      verify();
    }
  }, [transactionId, orderId]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border/30 rounded-2xl p-8 shadow-card text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          {verifying ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
            <Check className="w-8 h-8 text-primary" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {verifying ? "পেমেন্ট ভেরিফাই হচ্ছে..." : "পেমেন্ট সফল!"}
        </h2>
        <p className="text-muted-foreground">
          {verifying
            ? "আপনার পেমেন্ট যাচাই করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।"
            : "আপনার পেমেন্ট সফল হয়েছে। অর্ডার এখন প্রক্রিয়াধীন — অ্যাডমিন নিশ্চিত করলে সম্পন্ন হবে।"}
        </p>
        {orderId && (
          <div className="bg-secondary/50 rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-2xl font-bold font-mono text-primary">{orderId}</p>
              <button onClick={() => { navigator.clipboard.writeText(orderId); toast({ title: "কপি হয়েছে!" }); }} className="p-1.5 rounded-lg hover:bg-secondary transition"><Copy className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">এটি সেভ করে রাখুন</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Link to={`/track${orderId ? `?q=${orderId}` : ''}`}>
            <Button variant="outline" size="lg" className="w-full">অর্ডার ট্র্যাক করুন</Button>
          </Link>
          <Link to="/">
            <Button variant="hero" size="lg" className="w-full">হোমে ফিরুন</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
