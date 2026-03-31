import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "রাকিব হাসান",
    role: "ওয়েব ডেভেলপার",
    rating: 5,
    text: "অসাধারণ সার্ভিস! ৫ মিনিটের মধ্যে ক্রেডিট পেয়ে গেছি। সাপোর্ট টিমও অনেক হেল্পফুল।",
  },
  {
    name: "ফারহানা আক্তার",
    role: "ফ্রিল্যান্সার",
    rating: 5,
    text: "বিকাশে পেমেন্ট করে মিনিটের মধ্যে ক্রেডিট পেলাম। দারুণ অভিজ্ঞতা! আবারও কিনব।",
  },
  {
    name: "তানভীর আহমেদ",
    role: "স্টার্টআপ ফাউন্ডার",
    rating: 5,
    text: "প্রাইস অনেক ভালো, অন্য জায়গায় এত কম দামে পাওয়া যায় না। রেগুলার কাস্টমার হয়ে গেছি।",
  },
  {
    name: "নুসরাত জাহান",
    role: "UI/UX ডিজাইনার",
    rating: 4,
    text: "Lovable এ প্রজেক্ট করতে গিয়ে ক্রেডিট দরকার ছিল। এখান থেকে কিনে খুশি, ফাস্ট ডেলিভারি!",
  },
  {
    name: "সাকিব রহমান",
    role: "ফুলস্ট্যাক ডেভেলপার",
    rating: 5,
    text: "৩ বার কিনেছি, প্রতিবারই সুন্দর অভিজ্ঞতা। ক্রিপ্টো পেমেন্ট অপশনটাও দারুণ!",
  },
  {
    name: "মেহজাবিন চৌধুরী",
    role: "কনটেন্ট ক্রিয়েটর",
    rating: 5,
    text: "২৪/৭ সাপোর্ট সত্যিই আছে! রাত ১১টায় মেসেজ দিয়েও রিপ্লাই পেয়েছি। অনেক ভালো সার্ভিস।",
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-[#FF7A18] fill-[#FF7A18]" : "text-border"}`}
      />
    ))}
  </div>
);

const Testimonials = () => {
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
            আমাদের <span className="text-gradient-primary">গ্রাহকদের</span> মতামত
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">যারা ইতিমধ্যে ক্রেডিট কিনেছেন তাদের অভিজ্ঞতা</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
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
                  <p className="text-xs text-muted-foreground">{t.role}</p>
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
