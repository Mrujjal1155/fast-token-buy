import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
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
  label: "লেবেল",
  workingHours: "কর্মসময়",
};

const AdminSiteContent = () => {
  const { content, loading } = useSiteContent();
  const [editData, setEditData] = useState<SiteContent>(defaultContent);
  const [saving, setSaving] = useState<SectionKey | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("hero");
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
            onClick={() => setActiveSection(key)}
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
      </div>
    </div>
  );
};

export default AdminSiteContent;
