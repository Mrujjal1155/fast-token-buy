import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustBadges from "@/components/TrustBadges";
import PricingSection from "@/components/PricingSection";
import Testimonials from "@/components/Testimonials";
import OurReserves from "@/components/OurReserves";
import RecentPurchases from "@/components/RecentPurchases";
import Footer from "@/components/Footer";
import OrderFlow from "@/components/OrderFlow";
import { type CreditPackage } from "@/lib/packages";

const Index = () => {
  const [showOrderFlow, setShowOrderFlow] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);

  if (showOrderFlow) {
    return (
      <OrderFlow
        selectedPackage={selectedPackage}
        onBack={() => { setShowOrderFlow(false); setSelectedPackage(null); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Lovable Credits কিনুন — বাংলাদেশে সবচেয়ে সস্তায়"
        description="bKash, Nagad, Rocket ও Crypto দিয়ে Lovable AI ক্রেডিট কিনুন। মাত্র ৳৪০ থেকে শুরু। ৫ মিনিটে ডেলিভারি। ২৪% পর্যন্ত সাশ্রয়! হাজারো সন্তুষ্ট গ্রাহক।"
        keywords="lovable credits, lovable credit buy, buy lovable credits bangladesh, lovable ক্রেডিট কিনুন, bkash lovable, lovable credit bd, cheap lovable credits, lovable credit price, lovable ai credits, লাভেবল ক্রেডিট, lovable credit বাংলাদেশ"
        path="/"
      />
      <Navbar />
      <HeroSection onBuyNow={() => setShowOrderFlow(true)} />
      <TrustBadges />
      <PricingSection onSelectPackage={(pkg) => { setSelectedPackage(pkg); setShowOrderFlow(true); }} />
      <OurReserves />
      <Testimonials />
      <RecentPurchases />
      <Footer />
    </div>
  );
};

export default Index;
