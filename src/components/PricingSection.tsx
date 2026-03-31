import { motion } from "framer-motion";
import { Check, Star, Flame, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type CreditPackage } from "@/lib/packages";
import { usePackages } from "@/hooks/usePackages";

interface PricingSectionProps {
  onSelectPackage: (pkg: CreditPackage) => void;
}

const PricingSection = ({ onSelectPackage }: PricingSectionProps) => {
  return (
    <section id="pricing" className="py-16 md:py-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#7B61FF]/5 blur-[150px] pointer-events-none" />

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            কম খরচে <span className="text-gradient-primary">বেশি ক্রেডিট</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">স্মার্ট ইউজাররা সেরা ডিলটা বেছে নিচ্ছে — আপনিও নিন!</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`relative rounded-2xl p-[1px] transition-shadow duration-300 ${
                pkg.popular
                  ? "bg-gradient-primary shadow-glow scale-[1.02]"
                  : "bg-border/40 hover:shadow-glow-purple"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold shadow-glow">
                    <Flame className="w-3 h-3" /> সবাই এটাই নিচ্ছে!
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-card p-6 md:p-8 h-full flex flex-col">
                {pkg.savings && (
                  <span className="text-xs font-medium text-[#FF7A18] bg-[#FF7A18]/10 px-2 py-0.5 rounded-full w-fit mb-3 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {pkg.savings}
                  </span>
                )}

                <div className="mb-4 md:mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                    {pkg.credits} ক্রেডিট
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-bold text-gradient-primary">৳{pkg.price}</span>
                    <span className="text-muted-foreground text-sm">টাকা</span>
                  </div>
                  <p className="text-muted-foreground text-xs md:text-sm mt-1">
                    প্রতি ক্রেডিট মাত্র ৳{(pkg.price / pkg.credits).toFixed(2)}
                  </p>
                </div>

                <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-1">
                  {[
                    "৫ মিনিটে ডেলিভারি গ্যারান্টি",
                    "২৪/৭ লাইভ সাপোর্ট",
                    "১০০% নিরাপদ পেমেন্ট",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs md:text-sm text-secondary-foreground">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={pkg.popular ? "hero" : "outline"}
                  size="lg"
                  className="w-full"
                  onClick={() => onSelectPackage(pkg)}
                >
                  {pkg.popular ? "এখনই অর্ডার করুন" : "এখনই নিন"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
