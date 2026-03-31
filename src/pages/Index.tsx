import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustBadges from "@/components/TrustBadges";
import PricingSection from "@/components/PricingSection";
import RecentPurchases from "@/components/RecentPurchases";
import Footer from "@/components/Footer";
import OrderFlow from "@/components/OrderFlow";
import { type CreditPackage, packages } from "@/lib/packages";

const Index = () => {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);

  if (selectedPackage) {
    return (
      <OrderFlow
        selectedPackage={selectedPackage}
        onBack={() => setSelectedPackage(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onBuyNow={() => setSelectedPackage(packages[1])} />
      <TrustBadges />
      <PricingSection onSelectPackage={setSelectedPackage} />
      <Footer />
      <RecentPurchases />
    </div>
  );
};

export default Index;
