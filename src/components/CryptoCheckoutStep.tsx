import { useEffect, useState, useCallback } from "react";
import { Loader2, Copy, ExternalLink, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type PaymentState = "checking" | "success" | "failed";

interface CryptoCheckoutStepProps {
  orderId: string;
  paymentUrl: string;
  onSuccess: () => void;
  onBack: () => void;
  onRetry?: () => void;
}

const CryptoCheckoutStep = ({ orderId, paymentUrl, onSuccess, onBack, onRetry }: CryptoCheckoutStepProps) => {
  const [state, setState] = useState<PaymentState>("checking");

  const checkStatus = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("status")
      .eq("order_id", orderId)
      .maybeSingle();

    if (data?.status === "completed") {
      setState("success");
      toast({ title: "পেমেন্ট সফল হয়েছে! 🎉" });
      onSuccess();
    } else if (data?.status === "failed") {
      setState("failed");
      toast({ title: "পেমেন্ট ব্যর্থ হয়েছে", variant: "destructive" });
    }
  }, [orderId, onSuccess]);

  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(checkStatus, 5000);
    checkStatus();
    return () => clearInterval(interval);
  }, [orderId, checkStatus]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Re-open the payment URL
      window.open(paymentUrl, "_blank");
      setState("checking");
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
        state === "failed" ? "bg-destructive/10" : "bg-primary/10"
      }`}>
        {state === "checking" && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
        {state === "success" && <CheckCircle className="w-8 h-8 text-primary" />}
        {state === "failed" && <XCircle className="w-8 h-8 text-destructive" />}
      </div>

      <h2 className="text-2xl font-bold text-foreground">
        {state === "checking" && "পেমেন্ট সম্পন্ন করুন 🔐"}
        {state === "success" && "পেমেন্ট সফল! 🎉"}
        {state === "failed" && "পেমেন্ট ব্যর্থ হয়েছে ❌"}
      </h2>

      <p className="text-muted-foreground">
        {state === "checking" && "নিচের বাটনে ক্লিক করে পেমেন্ট করুন। পেমেন্ট হলে অটো নেক্সট স্টেপে যাবে।"}
        {state === "success" && "আপনার পেমেন্ট ভেরিফাই হয়েছে!"}
        {state === "failed" && "পেমেন্ট সম্পন্ন হয়নি। আবার চেষ্টা করুন অথবা অন্য মেথড ব্যবহার করুন।"}
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

      {state === "checking" && (
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

      {state === "failed" && (
        <div className="space-y-3">
          <Button variant="hero" size="lg" className="w-full py-6" onClick={handleRetry}>
            <RefreshCw className="w-4 h-4 mr-2" /> আবার পেমেন্ট করুন
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={onBack}>
            অন্য পেমেন্ট মেথড ব্যবহার করুন
          </Button>
        </div>
      )}

      {state !== "failed" && (
        <Button variant="outline" size="lg" className="w-full" onClick={onBack}>
          হোমে ফিরে যান
        </Button>
      )}
    </div>
  );
};

export default CryptoCheckoutStep;
