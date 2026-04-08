import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export const defaultContent: SiteContent = {
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

const CONTENT_KEYS = [
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
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", CONTENT_KEYS);

    if (data && data.length > 0) {
      const merged = { ...defaultContent };
      data.forEach((row) => {
        const section = keyToSection[row.key];
        if (section) {
          try {
            const parsed = JSON.parse(row.value);
            (merged as any)[section] = { ...(defaultContent as any)[section], ...parsed };
          } catch {}
        }
      });
      setContent(merged);
    }
    setLoading(false);
  }, []);

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
