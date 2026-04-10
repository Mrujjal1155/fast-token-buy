import { lazy, Suspense, useState } from "react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustBadges from "@/components/TrustBadges";
import PricingSection from "@/components/PricingSection";
import { type CreditPackage } from "@/lib/packages";
import { useLanguage } from "@/contexts/LanguageContext";

// Below-fold sections — lazy loaded
const Testimonials = lazy(() => import("@/components/Testimonials"));
const OurReserves = lazy(() => import("@/components/OurReserves"));
const RecentPurchases = lazy(() => import("@/components/RecentPurchases"));
const Footer = lazy(() => import("@/components/Footer"));
const OrderFlow = lazy(() => import("@/components/OrderFlow"));

const Index = () => {
  const [showOrderFlow, setShowOrderFlow] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const { t } = useLanguage();

  if (showOrderFlow) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <OrderFlow
          selectedPackage={selectedPackage}
          onBack={() => { setShowOrderFlow(false); setSelectedPackage(null); }}
        />
      </Suspense>
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
      <Suspense fallback={null}>
        <OurReserves />
        <Testimonials />
        <RecentPurchases />
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
