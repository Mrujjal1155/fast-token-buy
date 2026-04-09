import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Zap, Shield, Headphones, Star, Heart, Award } from "lucide-react";

interface TrustBadge {
  id: string;
  icon: string;
  title_en: string;
  title_bn: string;
  desc_en: string;
  desc_bn: string;
  color: string;
  sort_order: number;
  is_visible: boolean;
}

type EditLang = "en" | "bn";

const iconMap: Record<string, React.ComponentType<any>> = {
  zap: Zap, shield: Shield, headphones: Headphones, star: Star, heart: Heart, award: Award,
};

const AdminTrustBadges = () => {
  const [badges, setBadges] = useState<TrustBadge[]>([]);
  const [lang, setLang] = useState<EditLang>("en");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBadges = async () => {
    const { data } = await supabase.from("trust_badges").select("*").order("sort_order");
    if (data) setBadges(data as TrustBadge[]);
    setLoading(false);
  };

  useEffect(() => { fetchBadges(); }, []);

  const handleUpdate = async (id: string, field: string, value: string | number | boolean) => {
    const { error } = await supabase
      .from("trust_badges")
      .update({ [field]: value, updated_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) {
      toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
    } else {
      setBadges((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
    }
  };

  const handleAdd = async () => {
    const maxOrder = badges.length > 0 ? Math.max(...badges.map((b) => b.sort_order)) : 0;
    const { data, error } = await supabase
      .from("trust_badges")
      .insert({ icon: "zap", title_en: "New Badge", title_bn: "নতুন ব্যাজ", desc_en: "Description", desc_bn: "বিবরণ", color: "#FF7A18", sort_order: maxOrder + 1 })
      .select()
      .single();
    if (error) {
      toast({ title: "যোগ করা যায়নি", variant: "destructive" });
    } else if (data) {
      setBadges((prev) => [...prev, data as TrustBadge]);
      toast({ title: "নতুন ব্যাজ যোগ হয়েছে", variant: "success" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("trust_badges").delete().eq("id", id);
    if (error) {
      toast({ title: "মুছতে পারা যায়নি", variant: "destructive" });
    } else {
      setBadges((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "মুছে ফেলা হয়েছে", variant: "success" });
    }
  };

  if (loading) return <p className="text-muted-foreground text-center py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Trust Badges</h2>
          <p className="text-sm text-muted-foreground">হোমপেজে দেখানো trust badge গুলো ম্যানেজ করুন</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border/30 bg-secondary p-1">
            {(["en", "bn"] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                {l === "en" ? "EN" : "বাংলা"}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" /> নতুন ব্যাজ
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {badges.map((b) => {
          const IconComp = iconMap[b.icon] || Zap;
          return (
            <div key={b.id} className="bg-card border border-border/30 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${b.color}15` }}>
                  <IconComp className="w-4 h-4" style={{ color: b.color }} />
                </div>

                <div className="flex-1 w-full sm:w-auto">
                  <label className="text-xs text-muted-foreground mb-1 block">শিরোনাম ({lang === "en" ? "EN" : "বাংলা"})</label>
                  <Input
                    defaultValue={lang === "en" ? b.title_en : b.title_bn}
                    key={`title-${b.id}-${lang}`}
                    className="h-9 bg-secondary border-border/30 text-sm"
                    onBlur={(e) => handleUpdate(b.id, lang === "en" ? "title_en" : "title_bn", e.target.value)}
                  />
                </div>

                <div className="flex-1 w-full sm:w-auto">
                  <label className="text-xs text-muted-foreground mb-1 block">বিবরণ ({lang === "en" ? "EN" : "বাংলা"})</label>
                  <Input
                    defaultValue={lang === "en" ? b.desc_en : b.desc_bn}
                    key={`desc-${b.id}-${lang}`}
                    className="h-9 bg-secondary border-border/30 text-sm"
                    onBlur={(e) => handleUpdate(b.id, lang === "en" ? "desc_en" : "desc_bn", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="w-full sm:w-32">
                  <label className="text-xs text-muted-foreground mb-1 block">আইকন</label>
                  <select
                    value={b.icon}
                    onChange={(e) => handleUpdate(b.id, "icon", e.target.value)}
                    className="w-full h-9 rounded-md bg-secondary border border-border/30 text-sm px-2 text-foreground"
                  >
                    {Object.keys(iconMap).map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-28">
                  <label className="text-xs text-muted-foreground mb-1 block">রঙ</label>
                  <Input type="color" value={b.color} className="h-9 p-1 bg-secondary border-border/30"
                    onChange={(e) => handleUpdate(b.id, "color", e.target.value)} />
                </div>

                <div className="w-full sm:w-20">
                  <label className="text-xs text-muted-foreground mb-1 block">ক্রম</label>
                  <Input type="number" defaultValue={b.sort_order} className="h-9 bg-secondary border-border/30 text-sm"
                    onBlur={(e) => handleUpdate(b.id, "sort_order", parseInt(e.target.value) || 0)} />
                </div>

                <div className="flex gap-1.5 shrink-0 pt-5">
                  <button onClick={() => handleUpdate(b.id, "is_visible", !b.is_visible)}
                    className={`p-2 rounded-lg transition ${b.is_visible ? "text-primary bg-primary/10" : "text-muted-foreground bg-secondary"}`}>
                    {b.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(b.id)}
                    className="p-2 rounded-lg text-destructive bg-destructive/10 hover:bg-destructive/20 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {badges.length === 0 && (
        <p className="text-center text-muted-foreground py-6">কোনো ব্যাজ নেই। উপরের বাটন দিয়ে যোগ করুন।</p>
      )}
    </div>
  );
};

export default AdminTrustBadges;
