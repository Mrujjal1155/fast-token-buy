import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onBuyNow: () => void;
}

const HeroSection = ({ onBuyNow }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero pt-36 md:pt-20">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-primary/5 blur-[80px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] rounded-full bg-accent/5 blur-[60px] md:blur-[100px] pointer-events-none" />

      <div className="container relative z-10 text-center py-10 md:py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Limited offer badge */}
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6 md:mb-8 animate-pulse-glow">
            <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
            <span className="text-xs md:text-sm font-medium text-primary">Limited Time Offer — Save 24%</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6">
            Get <span className="text-gradient-primary">105 Credits</span>
            <br />
            for just <span className="text-gradient-primary">৳80</span>
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto mb-8 md:mb-10 px-2">
            Power up your Lovable projects with credits. Instant delivery, secure payments, and 24/7 support.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4 sm:px-0">
            <Button variant="hero" size="lg" className="text-base md:text-lg px-8 md:px-10 py-5 md:py-6" onClick={onBuyNow}>
              Buy Now <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-1" />
            </Button>
            <Button variant="outline" size="lg" className="text-base md:text-lg px-8 md:px-10 py-5 md:py-6 border-border/50" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              View Packages
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
