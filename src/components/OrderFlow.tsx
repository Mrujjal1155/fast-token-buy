import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, CreditCard, Check, Copy, CheckCheck, Tag, X, Loader2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type CreditPackage } from "@/lib/packages";
import { paymentMethods, cryptoTokens } from "@/lib/packages";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Step = "email" | "summary" | "payment" | "crypto-checkout" | "success";

interface OrderFlowProps {
  selectedPackage: CreditPackage;
  onBack: () => void;
}

const OrderFlow = ({ selectedPackage, onBack }: OrderFlowProps) => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string>(paymentMethods[0].id);
  const [transactionId, setTransactionId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Crypto state
  const [selectedCrypto, setSelectedCrypto] = useState<{ token: string; network: string; label: string }>(cryptoTokens[0]);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const { toast } = useToast();

  const currentPayment = paymentMethods.find((p) => p.id === selectedPayment)!;
  const isCrypto = currentPayment.type === "crypto";
  const finalPrice = Math.max(selectedPackage.price - couponDiscount, 0);

  const handleEmailSubmit = () => {
    if (!email || !email.includes("@")) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
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
      p_amount: selectedPackage.price,
    });

    if (error || !data || data.length === 0) {
      setCouponMessage("Failed to validate coupon");
      setValidatingCoupon(false);
      return;
    }

    const result = data[0];
    if (result.valid) {
      setCouponApplied(true);
      setCouponDiscount(Number(result.calculated_discount));
      setCouponMessage(result.message);
      toast({ title: "🎉 Coupon applied!", description: `You save ৳${result.calculated_discount}` });
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
        package_id: selectedPackage.id,
        credits: selectedPackage.credits,
        amount: finalPrice,
        currency: selectedPackage.currency,
        payment_method: `crypto-${selectedCrypto.token}-${selectedCrypto.network}`,
        transaction_id: "pending-crypto",
        coupon_code: couponApplied ? couponCode.trim().toUpperCase() : null,
        discount_amount: couponDiscount,
      })
      .select("order_id")
      .single();

    if (orderError || !orderData) {
      toast({ title: "Failed to create order", description: orderError?.message, variant: "destructive" });
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

    // Redirect to BlinkPay checkout
    window.location.href = paymentData.payment_url;
  };

  const handleSubmitOrder = async () => {
    if (isCrypto) {
      return handleCryptoPayment();
    }

    if (!transactionId.trim()) {
      toast({ title: "Please enter your Transaction ID", variant: "destructive" });
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
        package_id: selectedPackage.id,
        credits: selectedPackage.credits,
        amount: finalPrice,
        currency: selectedPackage.currency,
        payment_method: selectedPayment,
        transaction_id: transactionId.trim(),
        coupon_code: couponApplied ? couponCode.trim().toUpperCase() : null,
        discount_amount: couponDiscount,
      })
      .select("order_id")
      .single();

    if (error) {
      toast({ title: "Failed to submit order", description: error.message, variant: "destructive" });
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
    email: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Enter Your Email</h2>
          <p className="text-muted-foreground">Credits will be delivered to this email</p>
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
          Continue
        </Button>
      </div>
    ),
    summary: (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Order Summary</h2>
        </div>
        <div className="bg-secondary/50 rounded-xl p-6 space-y-4">
          <div className="flex justify-between text-foreground">
            <span>Package</span>
            <span className="font-semibold">{selectedPackage.credits} Credits</span>
          </div>
          <div className="flex justify-between text-foreground">
            <span>Email</span>
            <span className="text-muted-foreground text-sm">{email}</span>
          </div>
          <div className="flex justify-between text-foreground">
            <span>Subtotal</span>
            <span>৳{selectedPackage.price}</span>
          </div>

          {/* Coupon section */}
          {!couponApplied ? (
            <div className="border-t border-border/30 pt-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Coupon code"
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
                  {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
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
                  <span className="text-sm font-medium text-primary">-৳{couponDiscount}</span>
                  <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-border/30 pt-4 flex justify-between text-foreground">
            <span className="font-semibold">Total</span>
            <div className="text-right">
              {couponApplied && (
                <span className="text-sm text-muted-foreground line-through mr-2">৳{selectedPackage.price}</span>
              )}
              <span className="text-2xl font-bold text-gradient-primary">৳{finalPrice}</span>
            </div>
          </div>
        </div>
        <Button variant="hero" size="lg" className="w-full py-6" onClick={handleProceedToPayment}>
          Proceed to Payment
        </Button>
      </div>
    ),
    payment: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {isCrypto ? <Coins className="w-7 h-7 text-primary" /> : <CreditCard className="w-7 h-7 text-primary" />}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Complete Payment</h2>
          <p className="text-muted-foreground">
            {isCrypto ? "ক্রিপ্টো দিয়ে পেমেন্ট করুন" : `Send ৳${finalPrice} to complete your order`}
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
              <p className="text-sm font-medium text-foreground">টোকেন ও নেটওয়ার্ক নির্বাচন করুন:</p>
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
                আপনি <span className="text-foreground font-semibold">{selectedCrypto.label}</span> দিয়ে{" "}
                <span className="text-primary font-bold">৳{finalPrice}</span> সমপরিমাণ পে করবেন।
                BlinkPay চেকআউট পেজে রিডাইরেক্ট হবেন।
              </p>
            </div>
            <Button variant="hero" size="lg" className="w-full py-6" onClick={handleSubmitOrder} disabled={submitting}>
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> প্রসেসিং...</>
              ) : (
                <>Pay with {selectedCrypto.label}</>
              )}
            </Button>
          </div>
        ) : (
          /* Manual payment UI */
          <>
            <div className="bg-secondary/50 rounded-xl p-6 space-y-3">
              <p className="text-sm text-muted-foreground">Send Money to:</p>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-foreground font-mono">{currentPayment.number}</span>
                <button onClick={copyNumber} className="text-primary hover:text-primary/80 transition">
                  {copied ? <CheckCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Send exactly ৳{finalPrice} via {currentPayment.name} &quot;Send Money&quot; option. Then paste your Transaction ID below.
              </p>
            </div>

            <Input
              placeholder="Enter Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="h-12 bg-secondary border-border/50 text-center"
            />
            <Button variant="hero" size="lg" className="w-full py-6" onClick={handleSubmitOrder} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Order"}
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
        <h2 className="text-2xl font-bold text-foreground">Order Submitted!</h2>
        <p className="text-muted-foreground">Your order is being processed. Credits will be delivered to <span className="text-foreground font-medium">{email}</span></p>
        <div className="bg-secondary/50 rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Your Order ID</p>
          <p className="text-2xl font-bold font-mono text-primary">{orderId}</p>
          <p className="text-xs text-muted-foreground mt-2">Save this to track your order</p>
        </div>
        <Button variant="outline" size="lg" className="w-full" onClick={onBack}>
          Back to Home
        </Button>
      </div>
    ),
  };

  const steps: Step[] = ["email", "summary", "payment", "success"];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step !== "success" && (
          <button
            onClick={step === "email" ? onBack : () => setStep(steps[currentStepIndex - 1])}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}

        {step !== "success" && (
          <div className="flex gap-2 mb-8">
            {["email", "summary", "payment"].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i <= currentStepIndex ? "bg-gradient-primary" : "bg-border"
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
            className="bg-card border border-border/30 rounded-2xl p-8 shadow-card"
          >
            {stepContent[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderFlow;
