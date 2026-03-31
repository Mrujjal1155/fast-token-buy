import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { packages, type CreditPackage } from "@/lib/packages";

interface PricingSectionProps {
  onSelectPackage: (pkg: CreditPackage) => void;
}

const PricingSection = ({ onSelectPackage }: PricingSectionProps) => {
  return (
    <section id="pricing" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-gradient-primary">Package</span>
          </h2>
          <p className="text-muted-foreground text-lg">Simple pricing. No hidden fees.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={`relative rounded-2xl p-[1px] ${
                pkg.popular ? "bg-gradient-primary shadow-glow" : "bg-border/40"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold">
                    <Star className="w-3 h-3" /> Most Popular
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-card p-8 h-full flex flex-col">
                {pkg.savings && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit mb-3">
                    {pkg.savings}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {pkg.credits} Credits
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gradient-primary">৳{pkg.price}</span>
                    <span className="text-muted-foreground text-sm">BDT</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">
                    ৳{(pkg.price / pkg.credits).toFixed(2)} per credit
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {["Instant delivery", "24/7 support", "Secure payment"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-secondary-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0" />
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
                  Buy Now
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
