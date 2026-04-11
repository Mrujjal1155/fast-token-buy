import { motion } from "framer-motion";
import { Package, Mail, CreditCard, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const steps = [
  {
    titleKey: "howToOrder.step1.title" as const,
    descKey: "howToOrder.step1.desc" as const,
    icon: Package,
    gradient: "linear-gradient(135deg, #FF7A18, #FF3CAC)",
    shadow: "rgba(255, 122, 24, 0.3)",
  },
  {
    titleKey: "howToOrder.step2.title" as const,
    descKey: "howToOrder.step2.desc" as const,
    icon: Mail,
    gradient: "linear-gradient(135deg, #FF3CAC, #7B61FF)",
    shadow: "rgba(255, 60, 172, 0.3)",
  },
  {
    titleKey: "howToOrder.step3.title" as const,
    descKey: "howToOrder.step3.desc" as const,
    icon: CreditCard,
    gradient: "linear-gradient(135deg, #7B61FF, #4D8DFF)",
    shadow: "rgba(123, 97, 255, 0.3)",
  },
  {
    titleKey: "howToOrder.step4.title" as const,
    descKey: "howToOrder.step4.desc" as const,
    icon: Sparkles,
    gradient: "linear-gradient(135deg, #4D8DFF, #FF7A18)",
    shadow: "rgba(77, 141, 255, 0.3)",
  },
];

const HowToOrder = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-[#7B61FF]/4 blur-[150px] pointer-events-none" />

      <div className="container px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
            <span className="text-gradient-primary">{t("howToOrder.heading")}</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            {t("howToOrder.subtext")}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-2xl mx-auto relative">
          {/* Connecting gradient line — hidden on mobile */}
          <div
            className="absolute left-6 top-0 bottom-0 w-0.5 hidden md:block"
            style={{
              background: "linear-gradient(180deg, #FF7A18, #FF3CAC, #7B61FF, #4D8DFF)",
            }}
          />

          <div className="space-y-5 md:space-y-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                  className="flex gap-4 md:gap-6 items-start group"
                >
                  {/* Step number circle */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-lg font-bold text-foreground relative z-10 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: step.gradient,
                      boxShadow: `0 0 20px ${step.shadow}`,
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* Content card */}
                  <div className="flex-1 glass rounded-xl p-4 md:p-5 transition-all duration-300 group-hover:border-border/40 group-hover:shadow-lg">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <h3 className="text-base md:text-lg font-semibold text-foreground">
                        {t(step.titleKey)}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(step.descKey)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToOrder;
