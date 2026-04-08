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
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const [showOrderFlow, setShowOrderFlow] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const { t } = useLanguage();

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
        title={t("seo.title")}
        description={t("seo.description")}
        keywords={t("seo.keywords")}
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
