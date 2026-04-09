import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, CreditCard, Check, Copy, Tag, X, Loader2, Coins, Star, Package, Zap, PartyPopper, Minus, Plus, PackageCheck, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type CreditPackage } from "@/lib/packages";
import { paymentMethods, cryptoTokens } from "@/lib/packages";
import { usePackages } from "@/hooks/usePackages";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CryptoCheckoutStep from "./CryptoCheckoutStep";
import { useLanguage } from "@/contexts/LanguageContext";

type Step = "package" | "email" | "summary" | "payment" | "crypto-checkout" | "success";

interface OrderFlowProps {
  selectedPackage?: CreditPackage | null;
  onBack: () => void;
}

const OrderFlow = ({ selectedPackage: initialPackage, onBack }: OrderFlowProps) => {
  const { packages: allPackages } = usePackages();
  const [chosenPackage, setChosenPackage] = useState<CreditPackage | null>(initialPackage || null);
  const [step, setStep] = useState<Step>(initialPackage ? "email" : "package");
  const [email, setEmail] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cryptoPaymentUrl, setCryptoPaymentUrl] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentDeadline, setPaymentDeadline] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  // Crypto state
  const [selectedCrypto, setSelectedCrypto] = useState<{ token: string; network: string; label: string }>(cryptoTokens[0]);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [activePaymentMethods, setActivePaymentMethods] = useState<Array<{ id: string; name: string; color: string; type: "auto" | "crypto"; iconUrl?: string }>>(paymentMethods.map((m) => ({ ...m })));

  const { toast } = useToast();
  const { t } = useLanguage();

  // Fetch payment settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .or("key.like.payment_method_%,key.eq.ajkerpay_enabled");

      if (data) {
        const enabledMap: Record<string, boolean> = {};
        const iconMap: Record<string, string> = {};

        data.forEach((s) => {
          if (s.key.endsWith("_enabled") && s.key !== "ajkerpay_enabled") {
            const id = s.key.replace("payment_method_", "").replace("_enabled", "");
            enabledMap[id] = s.value === "true";
          } else if (s.key.endsWith("_icon") && s.value) {
            const id = s.key.replace("payment_method_", "").replace("_icon", "");
            iconMap[id] = s.value;
          }
        });

        const filtered = paymentMethods
          .filter((m) => enabledMap[m.id] !== false)
          .map((m) => ({
            ...m,
            iconUrl: iconMap[m.id] || undefined,
          }));

        setActivePaymentMethods(filtered);
        if (filtered.length > 0 && !selectedPayment) {
          setSelectedPayment(filtered[0].id);
        }
      }
    };
    fetchSettings();
  }, []);

  // Start countdown when entering payment step
  useEffect(() => {
    if (step === "payment" && !paymentDeadline) {
      setPaymentDeadline(Date.now() + 30 * 60 * 1000);
    }
  }, [step, paymentDeadline]);

  // Countdown timer tick
  useEffect(() => {
    if (!paymentDeadline) return;
    if (step === "success") return;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((paymentDeadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0 && orderId) {
        // Auto-fail the order
        supabase
          .from("orders")
          .update({ status: "failed" as const, admin_notes: "[Auto-failed: payment timeout 30 min]" })
          .eq("order_id", orderId)
          .then(() => {
            toast({ title: t("order.timeoutTitle"), description: t("order.timeoutDesc"), variant: "destructive" });
            setStep("package");
            setPaymentDeadline(null);
          });
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [paymentDeadline, orderId, step, toast, t]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentPayment = activePaymentMethods.find((p) => p.id === selectedPayment) || activePaymentMethods[0];
  const isCrypto = currentPayment?.type === "crypto";
  const totalPrice = chosenPackage ? chosenPackage.price * quantity : 0;
  const totalCredits = chosenPackage ? chosenPackage.credits * quantity : 0;
  const finalPrice = Math.max(totalPrice - couponDiscount, 0);

  const handleEmailSubmit = () => {
    if (!email || !email.includes("@")) {
      toast({ title: t("order.validEmail"), variant: "destructive" });
      return;
    }
    setStep("summary");
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponMessage("");

    const { data, error } = await supabase.rpc("validate_coupon", {
      p_code: couponCode.trim().toUpperCase(),
      p_amount: totalPrice,
    });

    if (error || !data || data.length === 0) {
      setCouponMessage(t("order.couponError"));
      setValidatingCoupon(false);
      return;
    }

    const result = data[0];
    if (result.valid) {
      setCouponApplied(true);
      setCouponDiscount(Number(result.calculated_discount));
      setCouponMessage(result.message);
      toast({ title: t("order.couponApplied"), description: `৳${result.calculated_discount} ${t("order.couponSaved")}`, variant: "success" });
    } else {
      setCouponMessage(result.message);
    }
    setValidatingCoupon(false);
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponMessage("");
  };

  const handleProceedToPayment = () => setStep("payment");

  const handleCryptoPayment = async () => {
    setSubmitting(true);

    // Increment coupon usage if applied
    if (couponApplied && couponCode) {
      await supabase.rpc("use_coupon", { p_code: couponCode.trim().toUpperCase() });
    }

    // First create the order in our DB
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        email,
        package_id: chosenPackage?.id,
        credits: totalCredits,
        amount: finalPrice,
        currency: chosenPackage?.currency,
        payment_method: `crypto-${selectedCrypto.token}-${selectedCrypto.network}`,
        transaction_id: "pending-crypto",
        coupon_code: couponApplied ? couponCode.trim().toUpperCase() : null,
        discount_amount: couponDiscount,
      })
      .select("order_id")
      .single();

    if (orderError || !orderData) {
      toast({ title: t("order.orderFailed"), description: orderError?.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const returnUrl = `${window.location.origin}/payment-success?order_id=${orderData.order_id}`;

    // Call our edge function to create BlinkPay payment
    const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
      "create-blinkpay-payment",
      {
        body: {
          amount: finalPrice,
          order_id: orderData.order_id,
          token: selectedCrypto.token,
          network: selectedCrypto.network,
          customer_email: email,
          return_url: returnUrl,
        },
      }
    );

    if (paymentError || !paymentData?.payment_url) {
      toast({
        title: t("order.paymentFailed"),
        description: paymentError?.message || paymentData?.error || "BlinkPay error",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Store payment URL and show checkout step
    setOrderId(orderData.order_id);
    setCryptoPaymentUrl(paymentData.payment_url);
    setStep("crypto-checkout");
    setSubmitting(false);

    // Also try to open in new tab
    window.open(paymentData.payment_url, "_blank");
  };

  const handleAjkerPayPayment = async () => {
    setSubmitting(true);

    if (couponApplied && couponCode) {
      await supabase.rpc("use_coupon", { p_code: couponCode.trim().toUpperCase() });
    }

    // Create order first
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        email,
        package_id: chosenPackage?.id,
        credits: totalCredits,
        amount: finalPrice,
        currency: chosenPackage?.currency,
        payment_method: `ajkerpay-${selectedPayment}`,
        transaction_id: "pending-ajkerpay",
        coupon_code: couponApplied ? couponCode.trim().toUpperCase() : null,
        discount_amount: couponDiscount,
      })
      .select("order_id")
      .single();

    if (orderError || !orderData) {
      toast({ title: t("order.orderFailed"), description: orderError?.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const successUrl = `${window.location.origin}/payment-success?order_id=${orderData.order_id}`;
    const cancelUrl = `${window.location.origin}/?cancelled=true`;

    const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
      "create-ajkerpay-payment",
      {
        body: {
          amount: finalPrice,
          order_id: orderData.order_id,
          customer_email: email,
          customer_name: "Customer",
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
      }
    );

    if (paymentError || !paymentData?.payment_url) {
      toast({
        title: t("order.paymentFailed"),
        description: paymentError?.message || paymentData?.error || "AjkerPay error",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Redirect to AjkerPay payment page
    setOrderId(orderData.order_id);
    setCryptoPaymentUrl(paymentData.payment_url);
    setStep("crypto-checkout");
    setSubmitting(false);
    window.open(paymentData.payment_url, "_blank");
  };

  const handleSubmitOrder = async () => {
    if (isCrypto) {
      return handleCryptoPayment();
    }

    // All non-crypto methods use AjkerPay auto payment
    return handleAjkerPayPayment();
  };



  const stepContent: Record<Step, React.ReactNode> = {
    package: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("order.choosePackage")}</h2>
          <p className="text-muted-foreground">{t("order.chooseSubtext")}</p>
        </div>
        <div className="space-y-3">
          {allPackages.map((pkg) => {
            const outOfStock = pkg.stock != null && pkg.stock <= 0;
            return (
            <button
              key={pkg.id}
              onClick={() => { if (!outOfStock) { setChosenPackage(pkg); setStep("email"); } }}
              disabled={outOfStock}
              className={`w-full text-left rounded-xl border p-4 transition-all ${outOfStock ? "opacity-50 cursor-not-allowed border-border/30 bg-secondary/20" : "hover:border-primary/50 hover:bg-secondary/50"} ${
                chosenPackage?.id === pkg.id ? "border-primary bg-primary/5" : "border-border/30 bg-secondary/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                     <span className="font-bold text-foreground text-lg">{pkg.credits} {t("pricing.credits")}</span>
                    {pkg.popular && !outOfStock && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold">
                        <Star className="w-3 h-3" /> {t("pricing.everyoneBuying")}
                      </span>
                    )}
                    {pkg.stock != null && (
                      outOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-semibold border border-destructive/20">
                          <XCircle className="w-3 h-3" /> Stock Out
                        </span>
                      ) : pkg.stock <= 5 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-semibold border border-yellow-500/20 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> {pkg.stock} left
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                          <PackageCheck className="w-3 h-3" /> In Stock
                        </span>
                      )
                    )}
                  </div>
                  {pkg.savings && <span className="text-xs text-primary font-medium">{pkg.savings}</span>}
                </div>
                <span className="text-2xl font-bold text-gradient-primary">৳{pkg.price}</span>
              </div>
            </button>
            );
          })}
        </div>
      </div>
    ),
    email: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("order.emailHeading")}</h2>
          <p className="text-muted-foreground">{t("order.emailSubtext")}</p>
        </div>
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 bg-secondary border-border/50 text-center text-lg"
          onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
        />
        <Button variant="hero" size="lg" className="w-full py-6" onClick={handleEmailSubmit}>
          {t("order.emailProceed")}
        </Button>
      </div>
    ),
    summary: (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("order.summaryHeading")}</h2>
          <p className="text-muted-foreground text-sm">{t("order.summarySubtext")}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-6 space-y-4">
          <div className="flex justify-between text-foreground">
            <span>{t("order.package")}</span>
            <span className="font-semibold">{chosenPackage?.credits} {t("pricing.credits")}</span>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between text-foreground">
            <span>একাউন্ট সংখ্যা</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-lg border border-border/50 bg-secondary flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-primary/10 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold text-foreground w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => {
                  const maxQty = chosenPackage?.stock != null ? chosenPackage.stock : 999;
                  return Math.min(maxQty, q + 1);
                })}
                disabled={chosenPackage?.stock != null ? quantity >= chosenPackage.stock : false}
                className="w-8 h-8 rounded-lg border border-border/50 bg-secondary flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-primary/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          {quantity > 1 && (
            <p className="text-xs text-primary">
              {quantity}টি একাউন্ট × {chosenPackage?.credits} = <span className="font-bold">{totalCredits} {t("pricing.credits")}</span>
            </p>
          )}

          <div className="flex justify-between text-foreground">
            <span>{t("order.email")}</span>
            <span className="text-muted-foreground text-sm">{email}</span>
          </div>
          <div className="flex justify-between text-foreground">
            <span>{t("order.subtotal")}</span>
            <span>৳{totalPrice}{quantity > 1 && <span className="text-xs text-muted-foreground ml-1">({quantity} × ৳{chosenPackage?.price})</span>}</span>
          </div>

          {/* Coupon section */}
          {!couponApplied ? (
            <div className="border-t border-border/30 pt-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("order.couponPlaceholder")}
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponMessage(""); }}
                    className="h-10 bg-background border-border/50 pl-9 uppercase"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                >
                  {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : t("order.apply")}
                </Button>
              </div>
              {couponMessage && !couponApplied && (
                <p className="text-xs text-destructive mt-2">{couponMessage}</p>
              )}
            </div>
          ) : (
            <div className="border-t border-border/30 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{couponCode.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-primary">-৳{couponDiscount} {t("order.couponSaved")}!</span>
                  <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-border/30 pt-4 flex justify-between text-foreground">
            <span className="font-semibold">{t("order.total")}</span>
            <div className="text-right">
              {couponApplied && (
                <span className="text-sm text-muted-foreground line-through mr-2">৳{totalPrice}</span>
              )}
              <span className="text-2xl font-bold text-gradient-primary">৳{finalPrice}</span>
            </div>
          </div>
        </div>
        <Button variant="hero" size="lg" className="w-full py-6" onClick={handleProceedToPayment}>
          {t("order.proceedPayment")}
        </Button>
      </div>
    ),
    payment: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {isCrypto ? <Coins className="w-7 h-7 text-primary" /> : <CreditCard className="w-7 h-7 text-primary" />}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("order.paymentHeading")}</h2>
          <p className="text-muted-foreground">
            {isCrypto ? t("order.paymentCrypto") : `${t("order.paymentSend")}${finalPrice} ${t("order.paymentCredits")}`}
          </p>
        </div>

        {/* Payment method tabs */}
        <div className="grid grid-cols-2 gap-3">
          {activePaymentMethods.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedPayment(m.id)}
              className={`relative py-4 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2.5 ${
                selectedPayment === m.id
                  ? "bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary text-primary shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)]"
                  : "bg-secondary/60 border-2 border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60 hover:bg-secondary/80"
              }`}
            >
              {selectedPayment === m.id && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
              {m.iconUrl ? (
                <img src={m.iconUrl} alt={`${m.name} payment method icon`} loading="lazy" className="w-7 h-7 rounded-md object-contain drop-shadow-md" />
              ) : (
                <span
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-md"
                  style={{ background: m.color }}
                >
                  {m.name.charAt(0)}
                </span>
              )}
              <span className="text-sm">{m.name}</span>
            </button>
          ))}
        </div>

        {isCrypto ? (
          /* Crypto payment UI */
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">{t("order.cryptoSelectToken")}</p>
              <div className="grid grid-cols-2 gap-2">
                {cryptoTokens.map((ct, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCrypto(ct)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      selectedCrypto.token === ct.token && selectedCrypto.network === ct.network
                        ? "bg-primary/10 border border-primary text-primary"
                        : "bg-background border border-border/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                {t("order.cryptoPayDesc").replace("{method}", selectedCrypto.label).replace("{amount}", String(finalPrice))}
              </p>
            </div>
            <Button variant="hero" size="lg" className="w-full py-6" onClick={handleSubmitOrder} disabled={submitting}>
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t("order.submitting")}</>
              ) : (
                <>{t("order.confirmPayment")} — {selectedCrypto.label} <Zap className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        ) : (
          /* AjkerPay auto payment UI */
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-400">{t("order.autoPaymentOn")}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("order.autoPayDesc").replace("{method}", currentPayment.name).replace("{amount}", String(finalPrice))}
              </p>
            </div>
            <Button variant="hero" size="lg" className="w-full py-6" onClick={handleSubmitOrder} disabled={submitting}>
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t("order.submitting")}</>
              ) : (
                <>{t("order.confirmPayment")} — {currentPayment.name} <Zap className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        )}
      </div>
    ),
    success: (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">{t("success.title")} <PartyPopper className="w-6 h-6 text-primary" /></h2>
        <p className="text-muted-foreground">{t("success.desc")}</p>
        <div className="bg-secondary/50 rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Order ID</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl font-bold font-mono text-primary">{orderId}</p>
            <button onClick={() => { navigator.clipboard.writeText(orderId); toast({ title: t("success.copied"), variant: "success" }); }} className="p-1.5 rounded-lg hover:bg-secondary transition"><Copy className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t("success.saveId")}</p>
        </div>
        <Button variant="outline" size="lg" className="w-full" onClick={onBack}>
          {t("success.goHome")}
        </Button>
      </div>
    ),
    "crypto-checkout": (
      <CryptoCheckoutStep
        orderId={orderId}
        paymentUrl={cryptoPaymentUrl}
        onSuccess={() => setStep("success")}
        onBack={onBack}
        onRetry={() => setStep("payment")}
      />
    ),
  };

  const steps: Step[] = ["package", "email", "summary", "payment", "crypto-checkout", "success"];
  const currentStepIndex = steps.indexOf(step);
  const progressSteps = ["package", "email", "summary", "payment"];
  const progressIndex = progressSteps.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-md">
        {step !== "success" && step !== "crypto-checkout" && (
          <button
            onClick={step === "package" ? onBack : () => setStep(steps[currentStepIndex - 1])}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-4 md:mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> {t("order.back")}
          </button>
        )}

        {step !== "success" && step !== "crypto-checkout" && (
          <div className="flex gap-2 mb-6 md:mb-8">
            {progressSteps.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i <= progressIndex ? "bg-gradient-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border/30 rounded-2xl p-5 md:p-8 shadow-card"
          >
            {stepContent[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderFlow;
