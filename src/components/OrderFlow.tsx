import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, CreditCard, Check, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type CreditPackage } from "@/lib/packages";
import { paymentMethods } from "@/lib/packages";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Step = "email" | "summary" | "payment" | "success";

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
  const { toast } = useToast();

  const currentPayment = paymentMethods.find((p) => p.id === selectedPayment)!;

  const handleEmailSubmit = () => {
    if (!email || !email.includes("@")) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setStep("summary");
  };

  const handleProceedToPayment = () => setStep("payment");

  const handleSubmitOrder = async () => {
    if (!transactionId.trim()) {
      toast({ title: "Please enter your Transaction ID", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const { data, error } = await supabase
      .from("orders")
      .insert({
        email,
        package_id: selectedPackage.id,
        credits: selectedPackage.credits,
        amount: selectedPackage.price,
        currency: selectedPackage.currency,
        payment_method: selectedPayment,
        transaction_id: transactionId.trim(),
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
          <div className="border-t border-border/30 pt-4 flex justify-between text-foreground">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold text-gradient-primary">৳{selectedPackage.price}</span>
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
            <CreditCard className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Complete Payment</h2>
          <p className="text-muted-foreground">Send ৳{selectedPackage.price} to complete your order</p>
        </div>

        <div className="flex gap-2">
          {paymentMethods.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedPayment(m.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                selectedPayment === m.id
                  ? "bg-primary/10 border-2 border-primary text-primary"
                  : "bg-secondary border-2 border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="bg-secondary/50 rounded-xl p-6 space-y-3">
          <p className="text-sm text-muted-foreground">Send Money to:</p>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-foreground font-mono">{currentPayment.number}</span>
            <button onClick={copyNumber} className="text-primary hover:text-primary/80 transition">
              {copied ? <CheckCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Send exactly ৳{selectedPackage.price} via {currentPayment.name} &quot;Send Money&quot; option. Then paste your Transaction ID below.
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
