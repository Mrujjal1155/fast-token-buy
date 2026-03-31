import { useSearchParams, Link } from "react-router-dom";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || "";

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border/30 rounded-2xl p-8 shadow-card text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">পেমেন্ট সফল!</h2>
        <p className="text-muted-foreground">
          আপনার পেমেন্ট ব্লকচেইনে ভেরিফাই হচ্ছে। কিছুক্ষণের মধ্যে ক্রেডিট আপনার অ্যাকাউন্টে যোগ হবে।
        </p>
        {orderId && (
          <div className="bg-secondary/50 rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
            <p className="text-2xl font-bold font-mono text-primary">{orderId}</p>
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
