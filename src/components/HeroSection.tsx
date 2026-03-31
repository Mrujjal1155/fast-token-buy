import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.png";

interface HeroSectionProps {
  onBuyNow: () => void;
}

const HeroSection = ({ onBuyNow }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden pt-36 md:pt-20">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})`, filter: "blur(1.5px)" }}
      />

      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(11,15,25,0.92)] via-[rgba(11,15,25,0.55)] to-[rgba(11,15,25,0.92)]" />

      {/* Brand color glow overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-[#FF7A18]/20 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[#4D8DFF]/20 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/3 w-1/3 h-1/2 bg-gradient-to-t from-[#FF3CAC]/15 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-[#7B61FF]/10 blur-[100px]" />
      </div>

      {/* Floating particles */}
      <motion.div
        className="absolute w-2 h-2 rounded-full bg-[#FF7A18]/40 blur-[2px]"
        style={{ top: '20%', left: '15%' }}
        animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full bg-[#FF3CAC]/40 blur-[2px]"
        style={{ top: '60%', left: '80%' }}
        animate={{ y: [8, -12, 8], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute w-2.5 h-2.5 rounded-full bg-[#7B61FF]/30 blur-[3px]"
        style={{ top: '35%', right: '20%' }}
        animate={{ y: [-15, 5, -15], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute w-1 h-1 rounded-full bg-[#4D8DFF]/50 blur-[1px]"
        style={{ bottom: '30%', left: '40%' }}
        animate={{ y: [5, -10, 5], x: [-3, 3, -3], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full bg-[#FF7A18]/30 blur-[2px]"
        style={{ top: '70%', left: '25%' }}
        animate={{ y: [-8, 12, -8], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Content */}
      <div className="container relative z-10 text-center py-10 md:py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Limited offer badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 md:px-5 py-2 rounded-full glass mb-6 md:mb-8 animate-pulse-glow"
          >
            <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#FF7A18]" />
            <span className="text-xs md:text-sm font-medium text-gradient-primary">Limited Time Offer — Save 24%</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6 leading-tight drop-shadow-lg">
            Get <span className="text-gradient-primary">105 Credits</span>
            <br />
            for just <span className="text-gradient-primary">৳80</span>
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto mb-8 md:mb-10 px-2 drop-shadow-md">
            Power up your Lovable projects with credits. Instant delivery, secure payments, and 24/7 support.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4 sm:px-0">
            <Button variant="hero" size="lg" className="text-base md:text-lg px-8 md:px-10 py-5 md:py-6 rounded-[14px]" onClick={onBuyNow}>
              Buy Now <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-1" />
            </Button>
            <Button variant="outline" size="lg" className="text-base md:text-lg px-8 md:px-10 py-5 md:py-6 rounded-[14px] border-border/50 hover:border-[#7B61FF]/50 transition-all duration-300" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              View Packages
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Mobile: increase overlay darkness */}
      <div className="absolute inset-0 bg-background/30 md:bg-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
