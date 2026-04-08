import { useState } from "react";
import { Star, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReviewFormProps {
  orderId: string;
}

const ReviewForm = ({ orderId }: ReviewFormProps) => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async () => {
    if (!name.trim() || !text.trim()) {
      toast({ title: t("review.nameRequired"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      order_id: orderId,
      name: name.trim().slice(0, 100),
      rating,
      text: text.trim().slice(0, 500),
    });
    setSubmitting(false);

    if (error) {
      toast({ title: t("review.failed"), variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: t("review.success"), variant: "success" });
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-primary/10 border border-primary/20 rounded-xl p-5 text-center"
      >
        <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-medium text-foreground">{t("review.submitted")}</p>
        <p className="text-xs text-muted-foreground mt-1">{t("review.approval")}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary/30 border border-border/30 rounded-xl p-5 space-y-4"
    >
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">{t("review.heading")}</p>
        <p className="text-xs text-muted-foreground">{t("review.subtext")}</p>
      </div>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hoveredStar || rating)
                  ? "text-[#FF7A18] fill-[#FF7A18]"
                  : "text-border"
              }`}
            />
          </button>
        ))}
      </div>

      <Input
        placeholder={t("review.namePlaceholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        className="h-10 bg-secondary border-border/50"
      />

      <Textarea
        placeholder={t("review.textPlaceholder")}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={500}
        rows={3}
        className="bg-secondary border-border/50 resize-none"
      />

      <Button
        variant="hero"
        size="sm"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full"
      >
        <Send className="w-4 h-4 mr-2" />
        {submitting ? t("review.submitting") : t("review.submit")}
      </Button>
    </motion.div>
  );
};

export default ReviewForm;
