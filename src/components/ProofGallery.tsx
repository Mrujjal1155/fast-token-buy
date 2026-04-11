import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Camera, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProofScreenshot {
  id: string;
  image_url: string;
  caption: string;
}

const ProofGallery = () => {
  const [screenshots, setScreenshots] = useState<ProofScreenshot[]>([]);
  const [selectedImage, setSelectedImage] = useState<ProofScreenshot | null>(null);
  const { lang } = useLanguage();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("proof_screenshots")
        .select("id, image_url, caption")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });
      if (data) setScreenshots(data as ProofScreenshot[]);
    };
    fetch();
  }, []);

  if (screenshots.length === 0) return null;

  return (
    <section className="py-16 md:py-24 relative overflow-hidden" id="proof">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {lang === "bn" ? "ডেলিভারি প্রুফ" : "Delivery Proof"}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {lang === "bn" ? "আমাদের সাম্প্রতিক ডেলিভারি" : "Our Recent Deliveries"}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {lang === "bn"
              ? "আমাদের সফল ক্রেডিট ডেলিভারির স্ক্রিনশট দেখুন"
              : "See screenshots of our successful credit deliveries"}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {screenshots.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedImage(s)}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-border/20 bg-card hover:border-primary/30 hover:shadow-[0_0_20px_-5px_rgba(255,122,24,0.15)] transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={s.image_url}
                  alt={s.caption || "Delivery proof"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              {s.caption && (
                <div className="p-2.5">
                  <p className="text-xs text-muted-foreground truncate">{s.caption}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-card border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground z-10 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={selectedImage.image_url}
                alt={selectedImage.caption || "Delivery proof"}
                className="w-full rounded-2xl border border-border/30"
              />
              {selectedImage.caption && (
                <p className="text-center text-sm text-muted-foreground mt-3">{selectedImage.caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProofGallery;
