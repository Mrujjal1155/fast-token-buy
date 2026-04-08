import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const Refund = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Refund Policy — Lovable Credits"
        description="Refund policy for LovableCredit.com. Learn when and how to get refunds, conditions and process."
        path="/refund"
        keywords="lovable credit refund, refund policy, lovable credit return policy, lovable credit money back"
      />
      <Navbar />
      <div className="container max-w-3xl px-4 pt-28 pb-16 md:pt-32">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 text-center">
          {t("refund.heading")}
        </h1>
        <p className="text-muted-foreground text-center mb-10">{t("refund.updated")}</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          {(["s1", "s2", "s3", "s4"] as const).map((s) => (
            <section key={s} className="glass rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">{t(`refund.${s}title` as any)}</h2>
              <p>{t(`refund.${s}text` as any)}</p>
            </section>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Refund;
