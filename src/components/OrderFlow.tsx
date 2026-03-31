import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, CreditCard, Check, Copy, CheckCheck, Tag, X, Loader2, Coins, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type CreditPackage } from "@/lib/packages";
import { paymentMethods, cryptoTokens } from "@/lib/packages";
import { usePackages } from "@/hooks/usePackages";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedPayment, setSelectedPayment] = useState<string>(paymentMethods[0].id);
  const [transactionId, setTransactionId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cryptoPaymentUrl, setCryptoPaymentUrl] = useState("");

  // Crypto state
  const [selectedCrypto, setSelectedCrypto] = useState<{ token: string; network: string; label: string }>(cryptoTokens[0]);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [ajkerpayEnabled, setAjkerpayEnabled] = useState(false);

  const { toast } = useToast();

  // Check if AjkerPay is enabled
  useEffect(() => {
    const checkAjkerPay = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ajkerpay_enabled")
        .maybeSingle();
      if (data) setAjkerpayEnabled(data.value === "true");
    };
    checkAjkerPay();
  }, []);

  const currentPayment = paymentMethods.find((p) => p.id === selectedPayment)!;
  const isCrypto = currentPayment.type === "crypto";
  const finalPrice = chosenPackage ? Math.max(chosenPackage.price - couponDiscount, 0) : 0;

  const handleEmailSubmit = () => {
    if (!email || !email.includes("@")) {
      toast({ title: "সঠিক ইমেইল দিন", variant: "destructive" });
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
      p_amount: chosenPackage?.price,
    });

    if (error || !data || data.length === 0) {
      setCouponMessage("কুপন যাচাই করা যায়নি");
      setValidatingCoupon(false);
      return;
    }

    const result = data[0];
    if (result.valid) {
      setCouponApplied(true);
      setCouponDiscount(Number(result.calculated_discount));
      setCouponMessage(result.message);
      toast({ title: "কুপন প্রয়োগ হয়েছে!", description: `আপনি ৳${result.calculated_discount} সাশ্রয় করেছেন` });
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
        credits: chosenPackage?.credits,
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
      toast({ title: "অর্ডার তৈরি করা যায়নি", description: orderError?.message, variant: "destructive" });
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
        title: "পেমেন্ট তৈরি করা যায়নি",
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
        credits: chosenPackage?.credits,
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
      toast({ title: "অর্ডার তৈরি করা যায়নি", description: orderError?.message, variant: "destructive" });
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
        title: "পেমেন্ট তৈরি করা যায়নি",
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

    // If AjkerPay enabled for manual methods, use auto payment
    if (ajkerpayEnabled && !isCrypto) {
      return handleAjkerPayPayment();
    }

    if (!transactionId.trim()) {
      toast({ title: "ট্রানজেকশন আইডি দিন", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    if (couponApplied && couponCode) {
      await supabase.rpc("use_coupon", { p_code: couponCode.trim().toUpperCase() });
    }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        email,
        package_id: chosenPackage?.id,
        credits: chosenPackage?.credits,
        amount: finalPrice,
        currency: chosenPackage?.currency,
        payment_method: selectedPayment,
        transaction_id: transactionId.trim(),
        coupon_code: couponApplied ? couponCode.trim().toUpperCase() : null,
        discount_amount: couponDiscount,
      })
      .select("order_id")
      .single();

    if (error) {
      toast({ title: "অর্ডার জমা দিতে সমস্যা হয়েছে", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    setOrderId(data.order_id);
    setStep("success");
    setSubmitting(false);
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(currentPayment.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stepContent: Record<Step, React.ReactNode> = {
    package: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">আপনার প্যাকেজ বাছুন ⚡</h2>
          <p className="text-muted-foreground">স্মার্ট ইউজাররা সেরা ডিলটাই বেছে নেয়!</p>
        </div>
        <div className="space-y-3">
          {allPackages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => { setChosenPackage(pkg); setStep("email"); }}
              className={`w-full text-left rounded-xl border p-4 transition-all hover:border-primary/50 hover:bg-secondary/50 ${
                chosenPackage?.id === pkg.id ? "border-primary bg-primary/5" : "border-border/30 bg-secondary/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-lg">{pkg.credits} ক্রেডিট</span>
                    {pkg.popular && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold">
                        <Star className="w-3 h-3" /> 🔥 সবাই এটাই নিচ্ছে
                      </span>
                    )}
                  </div>
                  {pkg.savings && <span className="text-xs text-primary font-medium">{pkg.savings}</span>}
                </div>
                <span className="text-2xl font-bold text-gradient-primary">৳{pkg.price}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    ),
    email: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">কোথায় ক্রেডিট পাঠাবো? 📧</h2>
          <p className="text-muted-foreground">যে Lovable অ্যাকাউন্টে ক্রেডিট চান, সেই ইমেইল দিন</p>
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
          এগিয়ে যান — প্রায় শেষ! 🚀
        </Button>
      </div>
    ),
    summary: (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">আপনার অর্ডার রেডি! ✅</h2>
          <p className="text-muted-foreground text-sm">সব ঠিক আছে তো? তাহলে পেমেন্টে যান!</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-6 space-y-4">
          <div className="flex justify-between text-foreground">
            <span>প্যাকেজ</span>
            <span className="font-semibold">{chosenPackage?.credits} ক্রেডিট</span>
          </div>
          <div className="flex justify-between text-foreground">
            <span>ইমেইল</span>
            <span className="text-muted-foreground text-sm">{email}</span>
          </div>
          <div className="flex justify-between text-foreground">
            <span>সাবটোটাল</span>
            <span>৳{chosenPackage?.price}</span>
          </div>

          {/* Coupon section */}
          {!couponApplied ? (
            <div className="border-t border-border/30 pt-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="কুপন কোড থাকলে দিন"
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
                  {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "প্রয়োগ"}
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
                  <span className="text-sm font-medium text-primary">{couponCode.toUpperCase()} ✨</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-primary">-৳{couponDiscount} সাশ্রয়!</span>
                  <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-border/30 pt-4 flex justify-between text-foreground">
            <span className="font-semibold">সর্বমোট</span>
            <div className="text-right">
              {couponApplied && (
                <span className="text-sm text-muted-foreground line-through mr-2">৳{chosenPackage?.price}</span>
              )}
              <span className="text-2xl font-bold text-gradient-primary">৳{finalPrice}</span>
            </div>
          </div>
        </div>
        <Button variant="hero" size="lg" className="w-full py-6" onClick={handleProceedToPayment}>
          পেমেন্ট করুন — মাত্র ১ স্টেপ বাকি! 🎯
        </Button>
      </div>
    ),
    payment: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {isCrypto ? <Coins className="w-7 h-7 text-primary" /> : <CreditCard className="w-7 h-7 text-primary" />}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">পেমেন্ট করুন 💸</h2>
          <p className="text-muted-foreground">
            {isCrypto ? "ক্রিপ্টো দিয়ে নিরাপদে পে করুন" : `মাত্র ৳${finalPrice} পাঠান — ক্রেডিট চলে আসবে!`}
          </p>
        </div>

        {/* Payment method tabs */}
        <div className="flex flex-wrap gap-2">
          {paymentMethods.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedPayment(m.id)}
              className={`flex-1 min-w-[70px] py-3 px-3 rounded-xl text-xs font-semibold transition-all ${
                selectedPayment === m.id
                  ? "bg-primary/10 border-2 border-primary text-primary"
                  : "bg-secondary border-2 border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {isCrypto ? (
          /* Crypto payment UI */
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">টোকেন ও নেটওয়ার্ক বাছুন:</p>
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
                <span className="text-foreground font-semibold">{selectedCrypto.label}</span> দিয়ে{" "}
                <span className="text-primary font-bold">৳{finalPrice}</span> সমপরিমাণ পে করবেন।
                সিকিউর BlinkPay চেকআউটে রিডাইরেক্ট হবেন।
              </p>
            </div>
            <Button variant="hero" size="lg" className="w-full py-6" onClick={handleSubmitOrder} disabled={submitting}>
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> প্রসেসিং হচ্ছে...</>
              ) : (
                <>এখনই পে করুন — {selectedCrypto.label} ⚡</>
              )}
            </Button>
          </div>
        ) : ajkerpayEnabled ? (
          /* AjkerPay auto payment UI */
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-400">অটো পেমেন্ট চালু</span>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">{currentPayment.name}</span> দিয়ে{" "}
                <span className="text-primary font-bold">৳{finalPrice}</span> পে করুন।
                সিকিউর AjkerPay পেমেন্ট পেজে রিডাইরেক্ট হবেন।
              </p>
            </div>
            <Button variant="hero" size="lg" className="w-full py-6" onClick={handleSubmitOrder} disabled={submitting}>
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> প্রসেসিং হচ্ছে...</>
              ) : (
                <>এখনই {currentPayment.name} দিয়ে পে করুন ⚡</>
              )}
            </Button>
          </div>
        ) : (
          /* Manual payment UI */
          <>
            <div className="bg-secondary/50 rounded-xl p-6 space-y-3">
              <p className="text-sm text-muted-foreground">👇 এই নম্বরে টাকা পাঠান:</p>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-foreground font-mono">{currentPayment.number}</span>
                <button onClick={copyNumber} className="text-primary hover:text-primary/80 transition">
                  {copied ? <CheckCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentPayment.name} থেকে &quot;Send Money&quot; করে ঠিক <span className="text-foreground font-semibold">৳{finalPrice}</span> পাঠান। তারপর নিচে ট্রানজেকশন আইডি বসান।
              </p>
            </div>

            <Input
              placeholder="ট্রানজেকশন আইডি বসান (যেমন: 8N4K2P)"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="h-12 bg-secondary border-border/50 text-center"
            />
            <Button variant="hero" size="lg" className="w-full py-6" onClick={handleSubmitOrder} disabled={submitting}>
              {submitting ? "জমা হচ্ছে..." : "অর্ডার কনফার্ম করুন ✅"}
            </Button>
          </>
        )}
      </div>
    ),
    success: (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">অর্ডার সফল! 🎉</h2>
        <p className="text-muted-foreground">আপনার ক্রেডিট খুব শীঘ্রই <span className="text-foreground font-medium">{email}</span> এ পৌঁছে যাবে!</p>
        <div className="bg-secondary/50 rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-1">আপনার অর্ডার আইডি</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl font-bold font-mono text-primary">{orderId}</p>
            <button onClick={() => { navigator.clipboard.writeText(orderId); toast({ title: "কপি হয়েছে!" }); }} className="p-1.5 rounded-lg hover:bg-secondary transition"><Copy className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">👆 এই আইডি দিয়ে যেকোনো সময় অর্ডার ট্র্যাক করতে পারবেন</p>
        </div>
        <Button variant="outline" size="lg" className="w-full" onClick={onBack}>
          হোমে ফিরে যান
        </Button>
      </div>
    ),
    "crypto-checkout": (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Coins className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">পেমেন্ট সম্পন্ন করুন 🔐</h2>
        <p className="text-muted-foreground">
          নিচের বাটনে ক্লিক করুন এবং সিকিউর পেমেন্ট পেজে পেমেন্ট করুন। সব নিরাপদ!
        </p>
        <div className="bg-secondary/50 rounded-xl p-6 space-y-3">
          <p className="text-sm text-muted-foreground mb-1">আপনার অর্ডার আইডি</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-xl font-bold font-mono text-primary">{orderId}</p>
            <button onClick={() => { navigator.clipboard.writeText(orderId); toast({ title: "কপি হয়েছে!" }); }} className="p-1.5 rounded-lg hover:bg-secondary transition"><Copy className="w-4 h-4 text-muted-foreground" /></button>
          </div>
        </div>
        <a
          href={cryptoPaymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button variant="hero" size="lg" className="w-full py-6">
            🔗 BlinkPay এ পেমেন্ট করুন
          </Button>
        </a>
        <p className="text-xs text-muted-foreground">
          পেমেন্ট হলে অটো আপডেট হবে। অর্ডার আইডি সেভ রাখুন! 📋
        </p>
        <Button variant="outline" size="lg" className="w-full" onClick={onBack}>
          হোমে ফিরে যান
        </Button>
      </div>
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
            <ArrowLeft className="w-4 h-4" /> পেছনে
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
