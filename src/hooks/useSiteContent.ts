import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export interface SiteContent {
  hero: {
    badge: string;
    headingPrefix: string;
    headingPrice: string;
    headingMiddle: string;
    headingCredits: string;
    headingSuffix: string;
    subtext: string;
    trustSafe: string;
    trustDelivery: string;
    btnPrimary: string;
    btnSecondary: string;
  };
  trustBadges: {
    badge1Title: string;
    badge1Desc: string;
    badge2Title: string;
    badge2Desc: string;
    badge3Title: string;
    badge3Desc: string;
  };
  pricing: {
    heading: string;
    headingHighlight: string;
    subtext: string;
    feature1: string;
    feature2: string;
    feature3: string;
    popularBadge: string;
    btnPopular: string;
    btnNormal: string;
  };
  testimonials: {
    heading: string;
    headingHighlight: string;
    subtext: string;
  };
  reserves: {
    badge: string;
    heading: string;
    headingHighlight: string;
    subtext: string;
  };
  footer: {
    description: string;
    trustText: string;
    copyright: string;
    tagline: string;
    email: string;
    chatText: string;
    website: string;
    socialWebsite: string;
    socialTelegram: string;
    socialWhatsapp: string;
    socialEmail: string;
    socialFacebook: string;
    socialYoutube: string;
    socialInstagram: string;
    whatsappNumber: string;
  };
  operator: {
    label: string;
    workingHours: string;
  };
}

const defaultContentEn: SiteContent = {
  hero: {
    badge: "This offer won't last long — grab it now!",
    headingPrefix: "Get",
    headingPrice: "৳80",
    headingMiddle: "for",
    headingCredits: "105 Credits",
    headingSuffix: "— Today!",
    subtext: "Order in 1 minute, delivery in 5 minutes. Thousands of users already trust us.",
    trustSafe: "100% Safe",
    trustDelivery: "Instant Delivery",
    btnPrimary: "Get Credits Now",
    btnSecondary: "Start in 1 Minute",
  },
  trustBadges: {
    badge1Title: "5-Min Delivery",
    badge1Desc: "Order now, get it in minutes — guaranteed!",
    badge2Title: "100% Secure",
    badge2Desc: "Your money & data are fully protected",
    badge3Title: "24/7 Live Support",
    badge3Desc: "We're always here to help you",
  },
  pricing: {
    heading: "More Credits,",
    headingHighlight: "Less Cost",
    subtext: "Smart users are picking the best deal — you should too!",
    feature1: "5-minute delivery guarantee",
    feature2: "24/7 live support",
    feature3: "100% secure payment",
    popularBadge: "Most Popular!",
    btnPopular: "Order Now",
    btnNormal: "Get Now",
  },
  testimonials: {
    heading: "They're saying —",
    headingHighlight: '"Trustworthy!"',
    subtext: "It's not just us — our customers say so too",
  },
  reserves: {
    badge: "Live Stock Update",
    heading: "Our",
    headingHighlight: "Stock Reserve",
    subtext: "Sufficient stock in every package — order now before it runs out!",
  },
  footer: {
    description: "Bangladesh's most trusted Lovable credit seller. Fast delivery, best prices, hundreds of happy customers.",
    trustText: "Your security & satisfaction is our top priority",
    copyright: "© 2026 Lovable Credits. All rights reserved.",
    tagline: "Built on your trust — Lovable Credits",
    email: "support@lovablecredits.com",
    chatText: "Live Chat — Always On",
    website: "lovablecredits.com",
    socialWebsite: "#",
    socialTelegram: "#",
    socialWhatsapp: "#",
    socialEmail: "mailto:support@lovablecredits.com",
    socialFacebook: "#",
    socialYoutube: "#",
    socialInstagram: "#",
    whatsappNumber: "8801889067101",
  },
  operator: {
    label: "Operator:",
    workingHours: "Working Hours: 9:00 AM - 11:59 PM (GMT+06)",
  },
};

const defaultContentBn: SiteContent = {
  hero: {
    badge: "এই অফার আর বেশিদিন থাকবে না — এখনই নিন!",
    headingPrefix: "মাত্র",
    headingPrice: "৳৮০",
    headingMiddle: "তে পান",
    headingCredits: "১০৫ ক্রেডিট",
    headingSuffix: "— আজই!",
    subtext: "১ মিনিটে অর্ডার, ৫ মিনিটে ডেলিভারি। হাজারো ইউজার ইতিমধ্যে বিশ্বাস করে।",
    trustSafe: "১০০% নিরাপদ",
    trustDelivery: "তাৎক্ষণিক ডেলিভারি",
    btnPrimary: "এখনই ক্রেডিট নিন",
    btnSecondary: "১ মিনিটে শুরু করুন",
  },
  trustBadges: {
    badge1Title: "৫ মিনিটে ডেলিভারি",
    badge1Desc: "অর্ডার দিন, মিনিটে পান — গ্যারান্টি!",
    badge2Title: "১০০% নিরাপদ",
    badge2Desc: "আপনার টাকা ও তথ্য সম্পূর্ণ সুরক্ষিত",
    badge3Title: "২৪/৭ লাইভ সাপোর্ট",
    badge3Desc: "যেকোনো সমস্যায় আমরা পাশে আছি",
  },
  pricing: {
    heading: "কম খরচে",
    headingHighlight: "বেশি ক্রেডিট",
    subtext: "স্মার্ট ইউজাররা সেরা ডিলটা বেছে নিচ্ছে — আপনিও নিন!",
    feature1: "৫ মিনিটে ডেলিভারি গ্যারান্টি",
    feature2: "২৪/৭ লাইভ সাপোর্ট",
    feature3: "১০০% নিরাপদ পেমেন্ট",
    popularBadge: "সবাই এটাই নিচ্ছে!",
    btnPopular: "এখনই অর্ডার করুন",
    btnNormal: "এখনই নিন",
  },
  testimonials: {
    heading: "তারা বলছে —",
    headingHighlight: '"বিশ্বাসযোগ্য!"',
    subtext: "শুধু আমরা বলছি না — আমাদের গ্রাহকরাও বলছে",
  },
  reserves: {
    badge: "লাইভ স্টক আপডেট",
    heading: "আমাদের",
    headingHighlight: "স্টক রিজার্ভ",
    subtext: "প্রতিটি প্যাকেজে পর্যাপ্ত স্টক — দেরি না করে অর্ডার করুন!",
  },
  footer: {
    description: "বাংলাদেশের সবচেয়ে বিশ্বস্ত Lovable ক্রেডিট সেলার। দ্রুত ডেলিভারি, সেরা দাম, শত শত সন্তুষ্ট গ্রাহক।",
    trustText: "আপনার নিরাপত্তা ও সন্তুষ্টি আমাদের প্রথম অগ্রাধিকার",
    copyright: "© ২০২৬ Lovable Credits। সর্বস্বত্ব সংরক্ষিত।",
    tagline: "আপনার ভরসায় গড়ে উঠেছে Lovable Credits",
    email: "support@lovablecredits.com",
    chatText: "লাইভ চ্যাট — সবসময় চালু",
    website: "lovablecredits.com",
    socialWebsite: "#",
    socialTelegram: "#",
    socialWhatsapp: "#",
    socialEmail: "mailto:support@lovablecredits.com",
    socialFacebook: "#",
    socialYoutube: "#",
    socialInstagram: "#",
    whatsappNumber: "8801889067101",
  },
  operator: {
    label: "অপারেটর:",
    workingHours: "কর্মসময়: সকাল ৯:০০ - রাত ১১:৫৯ (GMT+06)",
  },
};

export const defaultContent = defaultContentEn;

const CONTENT_KEYS_BASE = [
  "content_hero",
  "content_trust_badges",
  "content_pricing",
  "content_testimonials",
  "content_reserves",
  "content_footer",
  "content_operator",
];

const keyToSection: Record<string, keyof SiteContent> = {
  content_hero: "hero",
  content_trust_badges: "trustBadges",
  content_pricing: "pricing",
  content_testimonials: "testimonials",
  content_reserves: "reserves",
  content_footer: "footer",
  content_operator: "operator",
};

export const useSiteContent = () => {
  const { lang } = useLanguage();
  const defaults = lang === "bn" ? defaultContentBn : defaultContentEn;
  const [content, setContent] = useState<SiteContent>(defaults);
  const [loading, setLoading] = useState(true);

  // Update content when language changes
  useEffect(() => {
    const newDefaults = lang === "bn" ? defaultContentBn : defaultContentEn;
    setContent(prev => {
      // Re-merge with new language defaults
      const merged = { ...newDefaults };
      return merged;
    });
    // Re-fetch from DB for this language
    fetchContent();
  }, [lang]);

  const fetchContent = useCallback(async () => {
    const currentDefaults = lang === "bn" ? defaultContentBn : defaultContentEn;
    
    // Fetch language-specific keys only
    const langKeys = CONTENT_KEYS_BASE.map(k => `${k}_${lang}`);
    
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", langKeys);

    const merged = { ...currentDefaults };
    
    if (data && data.length > 0) {
      data.forEach((row) => {
        const baseKey = row.key.replace(`_${lang}`, "");
        const section = keyToSection[baseKey];
        if (!section) return;
        try {
          const parsed = JSON.parse(row.value);
          (merged as any)[section] = { ...(currentDefaults as any)[section], ...parsed };
        } catch {}
      });
    }
    
    setContent(merged);
    setLoading(false);
  }, [lang]);

  useEffect(() => {
    fetchContent();

    const channelId = `site-content-${crypto.randomUUID()}`;
    const channel = supabase
      .channel(channelId)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => {
        fetchContent();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchContent]);

  return { content, loading };
};

export const updateSiteContent = async (section: keyof SiteContent, data: any) => {
  const key = Object.entries(keyToSection).find(([, v]) => v === section)?.[0];
  if (!key) return;

  const value = JSON.stringify(data);

  const { data: existing } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", key)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("site_settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key);
  } else {
    await supabase
      .from("site_settings")
      .insert({ key, value });
  }
};
