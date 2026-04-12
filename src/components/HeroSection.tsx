import { motion } from "framer-motion";
import { Zap, ArrowRight, Flame, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FloatingIcon {
  id: string;
  image_url: string;
  label: string;
  position_x: number;
  position_y: number;
  rotation: number;
  size: number;
}

interface HeroSectionProps {
  onBuyNow: () => void;
}

const HeroSection = ({ onBuyNow }: HeroSectionProps) => {
  const { content } = useSiteContent();
  const c = content.hero;
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([]);

  useEffect(() => {
    const fetchIcons = async () => {
      const { data } = await supabase
        .from("hero_floating_icons")
        .select("id, image_url, label, position_x, position_y, rotation, size")
        .eq("is_visible", true)
        .order("sort_order");
      if (data) setFloatingIcons(data as FloatingIcon[]);
    };
    fetchIcons();
  }, []);

  return (
    <section className="relative min-h-[75vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero pt-24 md:pt-20">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-[#FF7A18]/10 blur-[100px] md:blur-[150px] animate-hero-blob-1" />
        <div className="absolute top-1/3 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full bg-[#FF3CAC]/10 blur-[80px] md:blur-[120px] animate-hero-blob-2" />
        <div className="absolute bottom-1/4 right-1/3 w-[200px] md:w-[350px] h-[200px] md:h-[350px] rounded-full bg-[#7B61FF]/10 blur-[80px] md:blur-[120px] animate-hero-blob-3" />
        <div className="absolute bottom-0 left-1/4 w-[180px] md:w-[300px] h-[180px] md:h-[300px] rounded-full bg-[#4D8DFF]/8 blur-[60px] md:blur-[100px] animate-hero-blob-4" />
      </div>

      {/* Floating Icons - 3 left, 3 right */}
      {floatingIcons.slice(0, 6).map((icon, i) => {
        const floatDuration = 3 + (i % 3) * 0.8;
        const floatDelay = i * 0.4;

        // 3 on left side, 3 on right side — evenly spaced vertically
        const positions = [
          { x: 5, y: 12 },   // left top
          { x: 4, y: 45 },   // left middle
          { x: 7, y: 76 },   // left bottom
          { x: 85, y: 10 },  // right top
          { x: 87, y: 42 },  // right middle
          { x: 83, y: 74 },  // right bottom
        ];
        const pos = positions[i % 6];
        const isLeft = pos.x < 50;
        const mobileSize = Math.max(24, Math.round(icon.size * 0.45));

        return (
          <motion.div
            key={icon.id}
            className="absolute z-10 group cursor-pointer"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
            }}
            initial={{ opacity: 0, scale: 0, rotate: icon.rotation - 20 }}
            animate={{ opacity: 1, scale: 1, rotate: icon.rotation }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.8, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.3, rotate: 0, zIndex: 50, transition: { duration: 0.3 } }}
          >
            <motion.div
              animate={{
                y: [0, -12, 0],
                x: isLeft ? [0, 5, 0] : [0, -5, 0],
              }}
              transition={{
                duration: floatDuration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: floatDelay,
              }}
            >
              <div className="relative rounded-xl bg-card/80 backdrop-blur-sm border border-border/30 shadow-lg p-1.5 md:p-2.5 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(123,97,255,0.45)] group-hover:border-primary/50 group-hover:bg-card/95">
                {/* Glow pulse ring */}
                <motion.div
                  className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, rgba(255,122,24,0.25), rgba(123,97,255,0.25))' }}
                  animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Soft ambient glow */}
                <motion.div
                  className="absolute -inset-3 rounded-2xl blur-md -z-10"
                  style={{ background: i % 2 === 0 ? 'rgba(255,122,24,0.12)' : 'rgba(123,97,255,0.12)' }}
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                />
                <img
                  src={icon.image_url}
                  alt="icon"
                  className="relative z-10 object-contain transition-transform duration-300 group-hover:scale-110"
                  style={{ 
                    width: `clamp(${mobileSize}px, 5vw, ${icon.size}px)`, 
                    height: `clamp(${mobileSize}px, 5vw, ${icon.size}px)` 
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      <div className="container relative z-10 text-center py-10 md:py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 md:px-5 py-2 rounded-full glass mb-6 md:mb-8 animate-pulse-glow"
          >
            <Flame className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#FF7A18]" />
            <span className="text-xs md:text-sm font-medium text-gradient-primary">{c.badge}</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6 leading-tight">
            {c.headingPrefix} <span className="text-gradient-primary">{c.headingPrice}</span> {c.headingMiddle}
            <br />
            <span className="text-gradient-primary">{c.headingCredits}</span> {c.headingSuffix}
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto mb-4 px-2">
            {c.subtext}
          </p>

          <div className="flex items-center justify-center gap-4 mb-8 md:mb-10">
            <span className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {c.trustSafe}
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
              <Zap className="w-3.5 h-3.5 text-[#FF7A18]" /> {c.trustDelivery}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4 sm:px-0">
            <Button variant="hero" size="lg" className="text-base md:text-lg px-8 md:px-10 py-5 md:py-6 rounded-[14px]" onClick={onBuyNow}>
              {c.btnPrimary} <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-1" />
            </Button>
            <Button variant="outline" size="lg" className="text-base md:text-lg px-8 md:px-10 py-5 md:py-6 rounded-[14px] border-border/50 hover:border-[#7B61FF]/50 transition-all duration-300" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              {c.btnSecondary}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
