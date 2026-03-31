import { useEffect, useState } from "react";
import { Loader2, Copy, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CryptoCheckoutStepProps {
  orderId: string;
  paymentUrl: string;
  onSuccess: () => void;
  onBack: () => void;
}

const CryptoCheckoutStep = ({ orderId, paymentUrl, onSuccess, onBack }: CryptoCheckoutStepProps) => {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const checkStatus = async () => {
      const { data } = await supabase
        .from("orders")
        .select("status")
        .eq("order_id", orderId)
        .maybeSingle();

      if (data?.status === "completed") {
        setChecking(false);
        toast({ title: "পেমেন্ট সফল হয়েছে! 🎉" });
        onSuccess();
      }
    };

    // Poll every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    // Also check immediately
    checkStatus();

    return () => clearInterval(interval);
  }, [orderId, onSuccess]);

  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        {checking ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        ) : (
          <CheckCircle className="w-8 h-8 text-primary" />
        )}
      </div>
      <h2 className="text-2xl font-bold text-foreground">
        {checking ? "পেমেন্ট সম্পন্ন করুন 🔐" : "পেমেন্ট সফল! 🎉"}
      </h2>
      <p className="text-muted-foreground">
        {checking
          ? "নিচের বাটনে ক্লিক করে পেমেন্ট করুন। পেমেন্ট হলে অটো নেক্সট স্টেপে যাবে।"
          : "আপনার পেমেন্ট ভেরিফাই হয়েছে!"}
      </p>

      <div className="bg-secondary/50 rounded-xl p-6 space-y-3">
        <p className="text-sm text-muted-foreground mb-1">আপনার অর্ডার আইডি</p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-xl font-bold font-mono text-primary">{orderId}</p>
          <button
            onClick={() => { navigator.clipboard.writeText(orderId); toast({ title: "কপি হয়েছে!" }); }}
            className="p-1.5 rounded-lg hover:bg-secondary transition"
          >
            <Copy className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {checking && (
        <>
          <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="hero" size="lg" className="w-full py-6">
              <ExternalLink className="w-4 h-4 mr-2" /> পেমেন্ট পেজ খুলুন
            </Button>
          </a>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            পেমেন্ট চেক করা হচ্ছে... অটো আপডেট হবে
          </div>
        </>
      )}

      <Button variant="outline" size="lg" className="w-full" onClick={onBack}>
        হোমে ফিরে যান
      </Button>
    </div>
  );
};

export default CryptoCheckoutStep;
