import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Eye, EyeOff, ShieldCheck, Zap, Flame, ArrowRight, Check, TrendingUp, Clock, UserCircle, Mail, MessageCircle, ExternalLink, Globe } from "lucide-react";
import { type SiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";

type SectionKey = keyof SiteContent;
type EditLang = "en" | "bn";

const sectionLabels: Record<SectionKey, string> = {
  hero: "Hero Section",
  trustBadges: "Trust Badges",
  pricing: "Pricing Section",
  testimonials: "Testimonials",
  reserves: "Stock Reserve",
  footer: "Footer",
  operator: "Operator Status",
};

const fieldLabels: Record<string, Record<EditLang, string>> = {
  badge: { en: "Badge Text", bn: "ব্যাজ টেক্সট" },
  headingPrefix: { en: "Heading Start", bn: "হেডিং শুরু" },
  headingPrice: { en: "Heading Price", bn: "হেডিং প্রাইস" },
  headingMiddle: { en: "Heading Middle", bn: "হেডিং মাঝ" },
  headingCredits: { en: "Heading Credits", bn: "হেডিং ক্রেডিট" },
  headingSuffix: { en: "Heading End", bn: "হেডিং শেষ" },
  subtext: { en: "Subtext", bn: "সাব টেক্সট" },
  trustSafe: { en: "Safe Text", bn: "নিরাপদ টেক্সট" },
  trustDelivery: { en: "Delivery Text", bn: "ডেলিভারি টেক্সট" },
  btnPrimary: { en: "Primary Button", bn: "প্রাইমারি বাটন" },
  btnSecondary: { en: "Secondary Button", bn: "সেকেন্ডারি বাটন" },
  badge1Title: { en: "Badge 1 Title", bn: "ব্যাজ ১ শিরোনাম" },
  badge1Desc: { en: "Badge 1 Description", bn: "ব্যাজ ১ বিবরণ" },
  badge2Title: { en: "Badge 2 Title", bn: "ব্যাজ ২ শিরোনাম" },
  badge2Desc: { en: "Badge 2 Description", bn: "ব্যাজ ২ বিবরণ" },
  badge3Title: { en: "Badge 3 Title", bn: "ব্যাজ ৩ শিরোনাম" },
  badge3Desc: { en: "Badge 3 Description", bn: "ব্যাজ ৩ বিবরণ" },
  heading: { en: "Heading", bn: "হেডিং" },
  headingHighlight: { en: "Heading Highlight", bn: "হেডিং হাইলাইট" },
  feature1: { en: "Feature 1", bn: "ফিচার ১" },
  feature2: { en: "Feature 2", bn: "ফিচার ২" },
  feature3: { en: "Feature 3", bn: "ফিচার ৩" },
  popularBadge: { en: "Popular Badge", bn: "পপুলার ব্যাজ" },
  btnPopular: { en: "Popular Button", bn: "পপুলার বাটন" },
  btnNormal: { en: "Normal Button", bn: "নরমাল বাটন" },
  description: { en: "Description", bn: "বিবরণ" },
  trustText: { en: "Trust Text", bn: "ট্রাস্ট টেক্সট" },
  copyright: { en: "Copyright", bn: "কপিরাইট" },
  tagline: { en: "Tagline", bn: "ট্যাগলাইন" },
  email: { en: "Email", bn: "ইমেইল" },
  chatText: { en: "Chat Text", bn: "চ্যাট টেক্সট" },
  website: { en: "Website", bn: "ওয়েবসাইট" },
  socialWebsite: { en: "Website Link", bn: "ওয়েবসাইট লিংক" },
  socialTelegram: { en: "Telegram Link", bn: "টেলিগ্রাম লিংক" },
  socialWhatsapp: { en: "WhatsApp Link", bn: "হোয়াটসঅ্যাপ লিংক" },
  socialEmail: { en: "Email Link (mailto:...)", bn: "ইমেইল লিংক (mailto:...)" },
  socialFacebook: { en: "Facebook Link", bn: "Facebook লিংক" },
  socialYoutube: { en: "YouTube Link", bn: "YouTube লিংক" },
  socialInstagram: { en: "Instagram Link", bn: "Instagram লিংক" },
  whatsappNumber: { en: "WhatsApp Number (e.g. 8801XXXXXXXXX)", bn: "WhatsApp নম্বর (যেমন: 8801XXXXXXXXX)" },
  label: { en: "Label", bn: "লেবেল" },
  workingHours: { en: "Working Hours", bn: "কর্মসময়" },
};

const getFieldLabel = (field: string, lang: EditLang) => {
  return fieldLabels[field]?.[lang] || field;
};

// Default content per language
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

const defaultsByLang: Record<EditLang, SiteContent> = { en: defaultContentEn, bn: defaultContentBn };

const keyToSection: Record<string, keyof SiteContent> = {
  content_hero: "hero",
  content_trust_badges: "trustBadges",
  content_pricing: "pricing",
  content_testimonials: "testimonials",
  content_reserves: "reserves",
  content_footer: "footer",
  content_operator: "operator",
};

const sectionToKey: Record<keyof SiteContent, string> = Object.fromEntries(
  Object.entries(keyToSection).map(([k, v]) => [v, k])
) as any;

const CONTENT_KEYS_BASE = Object.keys(keyToSection);

/* ───── Section Preview Components ───── */

const HeroPreview = ({ data }: { data: SiteContent["hero"] }) => (
  <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(222,40%,8%)] p-6 text-center">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/30 mb-4">
      <Flame className="w-3 h-3 text-[#FF7A18]" />
      <span className="text-[10px] font-medium text-gradient-primary">{data.badge}</span>
    </div>
    <h2 className="text-lg font-bold mb-2 leading-tight">
      {data.headingPrefix} <span className="text-gradient-primary">{data.headingPrice}</span> {data.headingMiddle}
      <br />
      <span className="text-gradient-primary">{data.headingCredits}</span> {data.headingSuffix}
    </h2>
    <p className="text-[10px] text-muted-foreground mb-3">{data.subtext}</p>
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> {data.trustSafe}
      </span>
      <span className="w-0.5 h-0.5 rounded-full bg-border" />
      <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
        <Zap className="w-2.5 h-2.5 text-[#FF7A18]" /> {data.trustDelivery}
      </span>
    </div>
    <div className="flex gap-2 justify-center">
      <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FF7A18] to-[#FF3CAC] text-[10px] font-semibold text-white flex items-center gap-1">
        {data.btnPrimary} <ArrowRight className="w-2.5 h-2.5" />
      </button>
      <button className="px-3 py-1.5 rounded-lg border border-border/50 text-[10px] text-foreground">
        {data.btnSecondary}
      </button>
    </div>
  </div>
);

const TrustBadgesPreview = ({ data }: { data: SiteContent["trustBadges"] }) => (
  <div className="grid grid-cols-3 gap-2">
    {[
      { title: data.badge1Title, desc: data.badge1Desc, color: "#FF7A18", icon: <Zap className="w-3.5 h-3.5" style={{ color: "#FF7A18" }} /> },
      { title: data.badge2Title, desc: data.badge2Desc, color: "#7B61FF", icon: <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#7B61FF" }} /> },
      { title: data.badge3Title, desc: data.badge3Desc, color: "#4D8DFF", icon: <MessageCircle className="w-3.5 h-3.5" style={{ color: "#4D8DFF" }} /> },
    ].map((b, i) => (
      <div key={i} className="flex items-center gap-2 bg-secondary/50 border border-border/20 rounded-lg px-2 py-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${b.color}15` }}>
          {b.icon}
        </div>
        <div>
          <p className="text-[10px] font-semibold text-foreground leading-tight">{b.title}</p>
          <p className="text-[8px] text-muted-foreground leading-tight">{b.desc}</p>
        </div>
      </div>
    ))}
  </div>
);

const PricingPreview = ({ data }: { data: SiteContent["pricing"] }) => (
  <div className="text-center">
    <h3 className="text-sm font-bold mb-1">
      {data.heading} <span className="text-gradient-primary">{data.headingHighlight}</span>
    </h3>
    <p className="text-[9px] text-muted-foreground mb-3">{data.subtext}</p>
    <div className="grid grid-cols-3 gap-2">
      {[false, true, false].map((popular, i) => (
        <div key={i} className={`rounded-lg p-2.5 border text-center relative ${popular ? "border-primary/50 bg-primary/5" : "border-border/30 bg-secondary/30"}`}>
          {popular && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF7A18] to-[#FF3CAC] text-white font-semibold flex items-center gap-0.5">
                <Flame className="w-2 h-2" /> {data.popularBadge}
              </span>
            </div>
          )}
          <div className="mt-1 space-y-1">
            <p className="text-[9px] font-bold text-foreground">{[50, 105, 250][i]} Credits</p>
            <p className="text-xs font-bold text-gradient-primary">৳{[40, 80, 180][i]}</p>
          </div>
          <div className="mt-1.5 space-y-0.5">
            {[data.feature1, data.feature2, data.feature3].map((f, j) => (
              <p key={j} className="text-[7px] text-muted-foreground flex items-center gap-0.5">
                <Check className="w-2 h-2 text-emerald-400 shrink-0" /> {f}
              </p>
            ))}
          </div>
          <button className={`mt-2 w-full py-1 rounded text-[8px] font-semibold ${popular ? "bg-gradient-to-r from-[#FF7A18] to-[#FF3CAC] text-white" : "border border-border/50 text-foreground"}`}>
            {popular ? data.btnPopular : data.btnNormal}
          </button>
        </div>
      ))}
    </div>
  </div>
);

const TestimonialsPreview = ({ data }: { data: SiteContent["testimonials"] }) => (
  <div className="text-center">
    <h3 className="text-sm font-bold mb-1">
      {data.heading} <span className="text-gradient-primary">{data.headingHighlight}</span>
    </h3>
    <p className="text-[9px] text-muted-foreground mb-3">{data.subtext}</p>
    <div className="grid grid-cols-2 gap-2">
      {["Rakib Hasan", "Farhana Akter"].map((name) => (
        <div key={name} className="bg-secondary/50 border border-border/20 rounded-lg p-2.5 text-left">
          <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="text-[#FF7A18] text-[8px]">★</span>
            ))}
          </div>
          <p className="text-[8px] text-muted-foreground mb-1.5 line-clamp-2">"Great service, very fast delivery..."</p>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#FF7A18] to-[#FF3CAC] flex items-center justify-center text-[7px] text-white font-bold">
              {name.charAt(0)}
            </div>
            <span className="text-[8px] font-semibold text-foreground">{name}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ReservesPreview = ({ data }: { data: SiteContent["reserves"] }) => (
  <div className="text-center">
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/50 border border-border/20 mb-2">
      <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
      <span className="text-[8px] font-medium text-emerald-400">{data.badge}</span>
    </div>
    <h3 className="text-sm font-bold mb-1">
      {data.heading} <span className="text-gradient-primary">{data.headingHighlight}</span>
    </h3>
    <p className="text-[9px] text-muted-foreground">{data.subtext}</p>
  </div>
);

const FooterPreview = ({ data }: { data: SiteContent["footer"] }) => (
  <div className="border-t border-border/20 pt-3 space-y-2">
    <div className="text-center">
      <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> {data.trustText}
      </span>
    </div>
    <p className="text-[8px] text-muted-foreground leading-relaxed">{data.description}</p>
    <div className="flex items-center gap-3 text-[8px] text-muted-foreground">
      <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5 text-[#FF7A18]" /> {data.email}</span>
      <span className="flex items-center gap-1"><MessageCircle className="w-2.5 h-2.5 text-[#FF3CAC]" /> {data.chatText}</span>
    </div>
    <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
      <ExternalLink className="w-2.5 h-2.5 text-[#7B61FF]" /> {data.website}
    </div>
    <div className="flex justify-between border-t border-border/10 pt-2 text-[7px] text-muted-foreground">
      <span>{data.copyright}</span>
      <span>{data.tagline}</span>
    </div>
  </div>
);

const OperatorPreview = ({ data }: { data: SiteContent["operator"] }) => (
  <div className="flex items-center gap-2 bg-secondary/50 border border-border/20 rounded-lg px-3 py-2 justify-center">
    <UserCircle className="w-3.5 h-3.5 text-muted-foreground" />
    <span className="text-[10px] text-muted-foreground">{data.label}</span>
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[9px] font-semibold border border-green-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      Online
    </span>
    <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
      <Clock className="w-2.5 h-2.5" /> {data.workingHours}
    </span>
  </div>
);

const previewComponents: Record<SectionKey, (data: any) => JSX.Element> = {
  hero: (data) => <HeroPreview data={data} />,
  trustBadges: (data) => <TrustBadgesPreview data={data} />,
  pricing: (data) => <PricingPreview data={data} />,
  testimonials: (data) => <TestimonialsPreview data={data} />,
  reserves: (data) => <ReservesPreview data={data} />,
  footer: (data) => <FooterPreview data={data} />,
  operator: (data) => <OperatorPreview data={data} />,
};

/* ───── Helper: save content for a specific language ───── */
const saveContentForLang = async (section: SectionKey, data: any, lang: EditLang) => {
  const baseKey = sectionToKey[section];
  if (!baseKey) return;
  
  // Save with language suffix key only (e.g. content_hero_en, content_hero_bn)
  const langKey = `${baseKey}_${lang}`;
  const value = JSON.stringify(data);

  const { data: existing } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", langKey)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("site_settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", langKey);
  } else {
    await supabase
      .from("site_settings")
      .insert({ key: langKey, value });
  }
};

/* ───── Helper: load content for a specific language ───── */
const loadContentForLang = async (lang: EditLang): Promise<SiteContent> => {
  const defaults = defaultsByLang[lang];
  const langKeys = CONTENT_KEYS_BASE.map(k => `${k}_${lang}`);
  
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", langKeys);

  const merged = { ...defaults };
  
  if (data && data.length > 0) {
    data.forEach((row) => {
      const baseKey = row.key.replace(`_${lang}`, "");
      const section = keyToSection[baseKey];
      if (!section) return;
      try {
        const parsed = JSON.parse(row.value);
        (merged as any)[section] = { ...(defaults as any)[section], ...parsed };
      } catch {}
    });
  }
  
  return merged;
};

/* ───── Main Component ───── */

const AdminSiteContent = () => {
  const [editLang, setEditLang] = useState<EditLang>("en");
  const [editData, setEditData] = useState<SiteContent>(defaultContentEn);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SectionKey | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("hero");
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const loadData = useCallback(async (lang: EditLang) => {
    setLoading(true);
    const content = await loadContentForLang(lang);
    setEditData(content);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData(editLang);
  }, [editLang, loadData]);

  const handleFieldChange = (section: SectionKey, field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSave = async (section: SectionKey) => {
    setSaving(section);
    try {
      await saveContentForLang(section, editData[section], editLang);
      toast({ title: editLang === "bn" ? "সেভ হয়েছে!" : "Saved!", variant: "success" });
    } catch {
      toast({ title: editLang === "bn" ? "সেভ ব্যর্থ" : "Save failed", variant: "destructive" });
    }
    setSaving(null);
  };

  const handleReset = (section: SectionKey) => {
    const defaults = defaultsByLang[editLang];
    setEditData((prev) => ({
      ...prev,
      [section]: defaults[section],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sectionData = editData[activeSection] as Record<string, string>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Site Content Management</h2>
          <p className="text-sm text-muted-foreground">Edit all landing page text for each language</p>
        </div>
        
        {/* Language Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary border border-border/30">
          <button
            onClick={() => setEditLang("en")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              editLang === "en"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            English
          </button>
          <button
            onClick={() => setEditLang("bn")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              editLang === "bn"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            বাংলা
          </button>
        </div>
      </div>

      {/* Editing language indicator */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">
          {editLang === "en" ? "Editing English content" : "বাংলা কন্টেন্ট এডিট করছেন"}
        </span>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(sectionLabels) as SectionKey[]).map((key) => (
          <button
            key={key}
            onClick={() => { setActiveSection(key); setShowPreview(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSection === key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {sectionLabels[key]}
          </button>
        ))}
      </div>

      {/* Active section editor */}
      <div className="bg-card border border-border/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">{sectionLabels[activeSection]}</h3>
          <div className="flex gap-2">
            <Button
              variant={showPreview ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-1.5 text-xs"
            >
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPreview ? (editLang === "en" ? "Editor" : "এডিটর") : (editLang === "en" ? "Preview" : "প্রিভিউ")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleReset(activeSection)} className="text-xs">
              {editLang === "en" ? "Default" : "ডিফল্ট"}
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(activeSection)}
              disabled={saving === activeSection}
              className="gap-1.5"
            >
              {saving === activeSection ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editLang === "en" ? "Save" : "সেভ করুন"}
            </Button>
          </div>
        </div>

        {showPreview ? (
          <div className="border border-dashed border-primary/30 rounded-xl p-4 bg-background">
            <p className="text-[10px] text-primary font-medium mb-3 text-center flex items-center justify-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {editLang === "en" ? "Live Preview — see how it looks before saving" : "লাইভ প্রিভিউ — সেভ করার আগে দেখুন কেমন দেখাবে"}
            </p>
            {previewComponents[activeSection](editData[activeSection])}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(sectionData).map(([field, value]) => {
              const isLong = value.length > 60 || field.includes("desc") || field.includes("description") || field.includes("subtext");
              return (
                <div key={field} className={isLong ? "md:col-span-2" : ""}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    {getFieldLabel(field, editLang)}
                  </label>
                  {isLong ? (
                    <Textarea
                      value={value}
                      onChange={(e) => handleFieldChange(activeSection, field, e.target.value)}
                      className="bg-secondary border-border/50 text-sm min-h-[80px]"
                    />
                  ) : (
                    <Input
                      value={value}
                      onChange={(e) => handleFieldChange(activeSection, field, e.target.value)}
                      className="bg-secondary border-border/50 text-sm h-10"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSiteContent;
