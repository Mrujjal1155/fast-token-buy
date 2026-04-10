import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQ = () => {
  const [search, setSearch] = useState("");
  const { t } = useLanguage();

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
  ];

  const filtered = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("seo.faq.title")}
        description={t("seo.faq.description")}
        path="/faq"
        keywords={t("seo.faq.keywords")}
      />
      <Navbar />
      <div className="container max-w-3xl px-4 pt-28 pb-16 md:pt-32">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 text-center">
          {t("faq.heading")}
        </h1>
        <p className="text-muted-foreground text-center mb-8">{t("faq.subtext")}</p>

        <div className="relative mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("faq.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 glass border-border/30 focus-visible:ring-primary/50"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">{t("faq.noResults")}</p>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {filtered.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass rounded-xl px-5 border-none">
                <AccordionTrigger className="text-foreground font-medium text-left py-4 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
