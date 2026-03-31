import { useState } from "react";
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
      <Navbar />
      <HeroSection onBuyNow={() => setShowOrderFlow(true)} />
      <TrustBadges />
      <PricingSection onSelectPackage={(pkg) => { setSelectedPackage(pkg); setShowOrderFlow(true); }} />
      <Testimonials />
      <RecentPurchases />
      <Footer />
    </div>
  );
};

export default Index;
