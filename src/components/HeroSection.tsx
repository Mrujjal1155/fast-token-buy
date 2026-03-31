import { motion } from "framer-motion";
import { Zap, ArrowRight, Flame, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onBuyNow: () => void;
}

const HeroSection = ({ onBuyNow }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero pt-36 md:pt-20">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/3 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-[#FF7A18]/10 blur-[100px] md:blur-[150px] pointer-events-none animate-float-slow" />
      <div className="absolute top-1/3 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full bg-[#FF3CAC]/8 blur-[80px] md:blur-[120px] pointer-events-none animate-float-slow" style={{ animationDelay: '-3s' }} />
      <div className="absolute bottom-1/4 right-1/3 w-[200px] md:w-[350px] h-[200px] md:h-[350px] rounded-full bg-[#7B61FF]/8 blur-[80px] md:blur-[120px] pointer-events-none animate-float-slow" style={{ animationDelay: '-5s' }} />
      <div className="absolute bottom-0 left-1/4 w-[180px] md:w-[300px] h-[180px] md:h-[300px] rounded-full bg-[#4D8DFF]/6 blur-[60px] md:blur-[100px] pointer-events-none" />

      <div className="container relative z-10 text-center py-10 md:py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Urgency badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 md:px-5 py-2 rounded-full glass mb-6 md:mb-8 animate-pulse-glow"
          >
            <Flame className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#FF7A18]" />
            <span className="text-xs md:text-sm font-medium text-gradient-primary">এই অফার আর বেশিদিন থাকবে না — এখনই নিন!</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6 leading-tight">
            মাত্র <span className="text-gradient-primary">৳৮০</span> তে পান
            <br />
            <span className="text-gradient-primary">১০৫ ক্রেডিট</span> — আজই!
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto mb-4 px-2">
            ১ মিনিটে অর্ডার, ৫ মিনিটে ডেলিভারি। হাজারো ইউজার ইতিমধ্যে বিশ্বাস করে।
          </p>

          {/* Trust micro-signals */}
          <div className="flex items-center justify-center gap-4 mb-8 md:mb-10">
            <span className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ১০০% নিরাপদ
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
              <Zap className="w-3.5 h-3.5 text-[#FF7A18]" /> তাৎক্ষণিক ডেলিভারি
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4 sm:px-0">
            <Button variant="hero" size="lg" className="text-base md:text-lg px-8 md:px-10 py-5 md:py-6 rounded-[14px]" onClick={onBuyNow}>
              এখনই ক্রেডিট নিন <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-1" />
            </Button>
            <Button variant="outline" size="lg" className="text-base md:text-lg px-8 md:px-10 py-5 md:py-6 rounded-[14px] border-border/50 hover:border-[#7B61FF]/50 transition-all duration-300" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              ১ মিনিটে শুরু করুন
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
