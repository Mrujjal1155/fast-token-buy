import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useLanguage } from "@/contexts/LanguageContext";

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
}

interface ReviewStats {
  totalCount: number;
  avgRating: number;
}

const defaultTestimonials = [
  { id: "d1", name: "রাকিব হাসান", rating: 5, text: "ভাই ৫ মিনিটে ক্রেডিট পেয়ে গেলাম! বিশ্বাসই হচ্ছিল না এত ফাস্ট। সাপোর্ট টিমও সুপার ফ্রেন্ডলি।" },
  { id: "d2", name: "ফারহানা আক্তার", rating: 5, text: "বিকাশে পে করলাম, সাথে সাথে ক্রেডিট চলে আসলো। এত ঝামেলাহীন সার্ভিস আগে পাইনি! ১০/১০" },
  { id: "d3", name: "তানভীর আহমেদ", rating: 5, text: "অন্য জায়গায় দ্বিগুণ দাম নেয়। এখানে কম খরচে বেশি ক্রেডিট, রেগুলার কাস্টমার হয়ে গেছি।" },
  { id: "d4", name: "নুসরাত জাহান", rating: 5, text: "প্রথমে ভরসা পাচ্ছিলাম না, কিন্তু অর্ডার দেওয়ার পর বুঝলাম — এরা সত্যিই বিশ্বস্ত। ধন্যবাদ!" },
  { id: "d5", name: "সাকিব রহমান", rating: 5, text: "৩ বার কিনেছি, কোনোদিন সমস্যা হয়নি। ক্রিপ্টো অপশনটা বোনাস — সুপার কনভেনিয়েন্ট!" },
  { id: "d6", name: "মেহজাবিন চৌধুরী", rating: 5, text: "রাত ২টায় মেসেজ দিলাম, ১০ মিনিটে রিপ্লাই পেলাম! ২৪/৭ সাপোর্ট মিথ্যা না, সত্যিই আছে।" },
];

const INITIAL_COUNT = 6;
const LOAD_MORE_COUNT = 6;

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-[#FF7A18] fill-[#FF7A18]" : "text-border"}`} />
    ))}
  </div>
);

const Testimonials = () => {
  const [allReviews, setAllReviews] = useState<Review[]>(defaultTestimonials);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [stats, setStats] = useState<ReviewStats>({ totalCount: defaultTestimonials.length, avgRating: 5 });
  const { content } = useSiteContent();
  const c = content.testimonials;
  const { t } = useLanguage();

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from("reviews")
      .select("id, name, rating, text")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data && data.length > 0) {
      const combined = [...(data as Review[]), ...defaultTestimonials];
      const totalCount = combined.length;
      const avgRating = combined.reduce((sum, r) => sum + r.rating, 0) / combined.length;
      setAllReviews(combined);
      setStats({ totalCount, avgRating: Math.round(avgRating * 10) / 10 });
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    const channel = supabase
      .channel("reviews-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => {
        fetchReviews();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchReviews]);

  const visibleReviews = allReviews.slice(0, visibleCount);
  const hasMore = visibleCount < allReviews.length;
  const isExpanded = visibleCount > INITIAL_COUNT;

  return (
    <section className="py-16 md:py-24 relative">
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] rounded-full bg-[#FF3CAC]/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#7B61FF]/5 blur-[120px] pointer-events-none" />

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            {c.heading} <span className="text-gradient-primary">{c.headingHighlight}</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg mb-4">{c.subtext}</p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 glass rounded-full px-5 py-2.5">
              <Star className="w-5 h-5 text-[#FF7A18] fill-[#FF7A18]" />
              <span className="text-lg font-bold text-foreground">{stats.avgRating}</span>
              <span className="text-sm text-muted-foreground">{t("testimonials.avgRating")}</span>
            </div>
            <div className="glass rounded-full px-5 py-2.5">
              <span className="text-lg font-bold text-foreground">{stats.totalCount}+</span>
              <span className="text-sm text-muted-foreground ml-1">{t("testimonials.reviews")}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          <AnimatePresence>
            {visibleReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i < INITIAL_COUNT ? i * 0.1 : (i - visibleCount + LOAD_MORE_COUNT) * 0.08, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass rounded-2xl p-5 md:p-6 flex flex-col gap-4 hover:shadow-glow-purple transition-shadow duration-300"
              >
                <div className="flex items-start justify-between">
                  <StarRating rating={review.rating} />
                  <Quote className="w-5 h-5 text-[#7B61FF]/30" />
                </div>
                <p className="text-sm md:text-base text-secondary-foreground leading-relaxed flex-1">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/20">
                  <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.name}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex justify-center mt-8 gap-3">
          {hasMore && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, allReviews.length))}
              className="gap-2 glass border-border/30 hover:border-primary/50"
            >
              <ChevronDown className="w-4 h-4" />
              {t("testimonials.showMore")} ({allReviews.length - visibleCount} {t("testimonials.remaining")})
            </Button>
          )}
          {isExpanded && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setVisibleCount(INITIAL_COUNT)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronUp className="w-4 h-4" />
              {t("testimonials.showLess")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
