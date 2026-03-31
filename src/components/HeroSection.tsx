import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onBuyNow: () => void;
}

const HeroSection = ({ onBuyNow }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <div className="container relative z-10 text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Limited offer badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-8 animate-pulse-glow">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Limited Time Offer — Save 24%</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Get <span className="text-gradient-primary">105 Credits</span>
            <br />
            for just <span className="text-gradient-primary">৳80</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
            Power up your Lovable projects with credits. Instant delivery, secure payments, and 24/7 support.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-lg px-10 py-6" onClick={onBuyNow}>
              Buy Now <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-border/50" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              View Packages
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
