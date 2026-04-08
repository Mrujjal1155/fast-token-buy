import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || "";
  const transactionId = searchParams.get("transactionId") || "";
  const [verifying, setVerifying] = useState(false);
  const { t } = useLanguage();

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
          {verifying ? t("success.verifying") : t("success.title")}
        </h2>
        <p className="text-muted-foreground">
          {verifying ? t("success.verifyingDesc") : t("success.desc")}
        </p>
        {orderId && (
          <div className="bg-secondary/50 rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-2xl font-bold font-mono text-primary">{orderId}</p>
              <button onClick={() => { navigator.clipboard.writeText(orderId); toast({ title: t("success.copied"), variant: "success" }); }} className="p-1.5 rounded-lg hover:bg-secondary transition"><Copy className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t("success.saveId")}</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Link to={`/track${orderId ? `?q=${orderId}` : ''}`}>
            <Button variant="outline" size="lg" className="w-full">{t("success.trackOrder")}</Button>
          </Link>
          <Link to="/">
            <Button variant="hero" size="lg" className="w-full">{t("success.goHome")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
