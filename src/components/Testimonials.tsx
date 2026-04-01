import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-[#FF7A18] fill-[#FF7A18]" : "text-border"}`} />
    ))}
  </div>
);

const Testimonials = () => {
  const [reviews, setReviews] = useState<Review[]>(defaultTestimonials);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, name, rating, text")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(12);
      if (data && data.length > 0) {
        setReviews([...(data as Review[]), ...defaultTestimonials].slice(0, 9));
      }
    };
    fetchReviews();
  }, []);

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
            তারা বলছে — <span className="text-gradient-primary">"বিশ্বাসযোগ্য!"</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">শুধু আমরা বলছি না — আমাদের গ্রাহকরাও বলছে</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {reviews.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass rounded-2xl p-5 md:p-6 flex flex-col gap-4 hover:shadow-glow-purple transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <StarRating rating={t.rating} />
                <Quote className="w-5 h-5 text-[#7B61FF]/30" />
              </div>

              <p className="text-sm md:text-base text-secondary-foreground leading-relaxed flex-1">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-border/20">
                <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
