import { useEffect, useState, useCallback } from "react";
import { Loader2, Copy, ExternalLink, CheckCircle, XCircle, RefreshCw, Lock, PartyPopper, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

  const checkStatus = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("status")
      .eq("order_id", orderId)
      .maybeSingle();

    if (data?.status === "completed") {
      setState("success");
      toast({ title: t("crypto.toastSuccess"), variant: "success" });
      onSuccess();
    } else if (data?.status === "failed") {
      setState("failed");
      toast({ title: t("crypto.toastFailed"), variant: "destructive" });
    }
  }, [orderId, onSuccess, t]);

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

      <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
        {state === "checking" && <><Lock className="w-5 h-5 text-primary" /> {t("crypto.completePayment")}</>}
        {state === "success" && <><PartyPopper className="w-5 h-5 text-primary" /> {t("crypto.paymentSuccess")}</>}
        {state === "failed" && <><ShieldX className="w-5 h-5 text-destructive" /> {t("crypto.paymentFailed")}</>}
      </h2>

      <p className="text-muted-foreground">
        {state === "checking" && t("crypto.checkingDesc")}
        {state === "success" && t("crypto.successDesc")}
        {state === "failed" && t("crypto.failedDesc")}
      </p>

      <div className="bg-secondary/50 rounded-xl p-6 space-y-3">
        <p className="text-sm text-muted-foreground mb-1">{t("crypto.yourOrderId")}</p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-xl font-bold font-mono text-primary">{orderId}</p>
          <button
            onClick={() => { navigator.clipboard.writeText(orderId); toast({ title: t("crypto.copied"), variant: "success" }); }}
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
              <ExternalLink className="w-4 h-4 mr-2" /> {t("crypto.openPaymentPage")}
            </Button>
          </a>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            {t("crypto.checkingPayment")}
          </div>
        </>
      )}

      {state === "failed" && (
        <div className="space-y-3">
          <Button variant="hero" size="lg" className="w-full py-6" onClick={handleRetry}>
            <RefreshCw className="w-4 h-4 mr-2" /> {t("crypto.retryPayment")}
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={onBack}>
            {t("crypto.useDifferentMethod")}
          </Button>
        </div>
      )}

      {state !== "failed" && (
        <Button variant="outline" size="lg" className="w-full" onClick={onBack}>
          {t("crypto.goHome")}
        </Button>
      )}
    </div>
  );
};

export default CryptoCheckoutStep;
