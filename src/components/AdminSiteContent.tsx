import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Eye, EyeOff, ShieldCheck, Zap, Flame, ArrowRight, Check, TrendingUp, Clock, UserCircle, Mail, MessageCircle, ExternalLink } from "lucide-react";
import { useSiteContent, updateSiteContent, defaultContent, type SiteContent } from "@/hooks/useSiteContent";

type SectionKey = keyof SiteContent;

const sectionLabels: Record<SectionKey, string> = {
  hero: "🏠 হিরো সেকশন",
  trustBadges: "🛡️ ট্রাস্ট ব্যাজ",
  pricing: "💰 প্রাইসিং সেকশন",
  testimonials: "⭐ টেস্টিমোনিয়াল",
  reserves: "📦 স্টক রিজার্ভ",
  footer: "📋 ফুটার",
  operator: "👤 অপারেটর স্ট্যাটাস",
};

const fieldLabels: Record<string, string> = {
  badge: "ব্যাজ টেক্সট",
  headingPrefix: "হেডিং শুরু",
  headingPrice: "হেডিং প্রাইস",
  headingMiddle: "হেডিং মাঝ",
  headingCredits: "হেডিং ক্রেডিট",
  headingSuffix: "হেডিং শেষ",
  subtext: "সাব টেক্সট",
  trustSafe: "নিরাপদ টেক্সট",
  trustDelivery: "ডেলিভারি টেক্সট",
  btnPrimary: "প্রাইমারি বাটন",
  btnSecondary: "সেকেন্ডারি বাটন",
  badge1Title: "ব্যাজ ১ শিরোনাম",
  badge1Desc: "ব্যাজ ১ বিবরণ",
  badge2Title: "ব্যাজ ২ শিরোনাম",
  badge2Desc: "ব্যাজ ২ বিবরণ",
  badge3Title: "ব্যাজ ৩ শিরোনাম",
  badge3Desc: "ব্যাজ ৩ বিবরণ",
  heading: "হেডিং",
  headingHighlight: "হেডিং হাইলাইট",
  feature1: "ফিচার ১",
  feature2: "ফিচার ২",
  feature3: "ফিচার ৩",
  popularBadge: "পপুলার ব্যাজ",
  btnPopular: "পপুলার বাটন",
  btnNormal: "নরমাল বাটন",
  description: "বিবরণ",
  trustText: "ট্রাস্ট টেক্সট",
  copyright: "কপিরাইট",
  tagline: "ট্যাগলাইন",
  email: "ইমেইল",
  chatText: "চ্যাট টেক্সট",
  website: "ওয়েবসাইট",
  socialWebsite: "🔗 ওয়েবসাইট লিংক",
  socialTelegram: "📨 টেলিগ্রাম লিংক",
  socialWhatsapp: "💬 হোয়াটসঅ্যাপ লিংক",
  socialEmail: "📧 ইমেইল লিংক (mailto:...)",
  label: "লেবেল",
  workingHours: "কর্মসময়",
};

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
            <p className="text-[9px] font-bold text-foreground">{[50, 105, 250][i]} ক্রেডিট</p>
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
      {["রাকিব হাসান", "ফারহানা আক্তার"].map((name) => (
        <div key={name} className="bg-secondary/50 border border-border/20 rounded-lg p-2.5 text-left">
          <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="text-[#FF7A18] text-[8px]">★</span>
            ))}
          </div>
          <p className="text-[8px] text-muted-foreground mb-1.5 line-clamp-2">"দারুণ সার্ভিস, খুবই দ্রুত ডেলিভারি..."</p>
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
      অনলাইন
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

/* ───── Main Component ───── */

const AdminSiteContent = () => {
  const { content, loading } = useSiteContent();
  const [editData, setEditData] = useState<SiteContent>(defaultContent);
  const [saving, setSaving] = useState<SectionKey | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("hero");
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) setEditData(content);
  }, [content, loading]);

  const handleFieldChange = (section: SectionKey, field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSave = async (section: SectionKey) => {
    setSaving(section);
    try {
      await updateSiteContent(section, editData[section]);
      toast({ title: "সেভ হয়েছে!", variant: "success" });
    } catch {
      toast({ title: "সেভ ব্যর্থ", variant: "destructive" });
    }
    setSaving(null);
  };

  const handleReset = (section: SectionKey) => {
    setEditData((prev) => ({
      ...prev,
      [section]: defaultContent[section],
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
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">সাইট কন্টেন্ট ম্যানেজমেন্ট</h2>
        <p className="text-sm text-muted-foreground">ল্যান্ডিং পেইজের সকল টেক্সট এখান থেকে পরিবর্তন করুন</p>
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
              {showPreview ? "এডিটর" : "প্রিভিউ"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleReset(activeSection)} className="text-xs">
              ডিফল্ট
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(activeSection)}
              disabled={saving === activeSection}
              className="gap-1.5"
            >
              {saving === activeSection ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              সেভ করুন
            </Button>
          </div>
        </div>

        {showPreview ? (
          <div className="border border-dashed border-primary/30 rounded-xl p-4 bg-background">
            <p className="text-[10px] text-primary font-medium mb-3 text-center">📱 লাইভ প্রিভিউ — সেভ করার আগে দেখুন কেমন দেখাবে</p>
            {previewComponents[activeSection](editData[activeSection])}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(sectionData).map(([field, value]) => {
              const isLong = value.length > 60 || field.includes("desc") || field.includes("description") || field.includes("subtext");
              return (
                <div key={field} className={isLong ? "md:col-span-2" : ""}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    {fieldLabels[field] || field}
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
