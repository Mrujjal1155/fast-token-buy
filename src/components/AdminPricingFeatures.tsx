import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Check } from "lucide-react";

interface PricingFeature {
  id: string;
  text_en: string;
  text_bn: string;
  sort_order: number;
  is_visible: boolean;
}

type EditLang = "en" | "bn";

const AdminPricingFeatures = () => {
  const [features, setFeatures] = useState<PricingFeature[]>([]);
  const [lang, setLang] = useState<EditLang>("en");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFeatures = async () => {
    const { data } = await supabase.from("pricing_features").select("*").order("sort_order");
    if (data) setFeatures(data as PricingFeature[]);
    setLoading(false);
  };

  useEffect(() => { fetchFeatures(); }, []);

  const handleUpdate = async (id: string, field: string, value: string | number | boolean) => {
    const { error } = await supabase
      .from("pricing_features")
      .update({ [field]: value, updated_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) {
      toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
    } else {
      setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
    }
  };

  const handleAdd = async () => {
    const maxOrder = features.length > 0 ? Math.max(...features.map((f) => f.sort_order)) : 0;
    const { data, error } = await supabase
      .from("pricing_features")
      .insert({ text_en: "New feature", text_bn: "নতুন ফিচার", sort_order: maxOrder + 1 })
      .select()
      .single();
    if (error) {
      toast({ title: "যোগ করা যায়নি", variant: "destructive" });
    } else if (data) {
      setFeatures((prev) => [...prev, data as PricingFeature]);
      toast({ title: "নতুন ফিচার যোগ হয়েছে", variant: "success" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("pricing_features").delete().eq("id", id);
    if (error) {
      toast({ title: "মুছতে পারা যায়নি", variant: "destructive" });
    } else {
      setFeatures((prev) => prev.filter((f) => f.id !== id));
      toast({ title: "মুছে ফেলা হয়েছে", variant: "success" });
    }
  };

  if (loading) return <p className="text-muted-foreground text-center py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Pricing Features</h2>
          <p className="text-sm text-muted-foreground">প্রাইসিং কার্ডে দেখানো ফিচার লিস্ট ম্যানেজ করুন</p>
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
            <Plus className="w-4 h-4 mr-1" /> নতুন ফিচার
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {features.map((f) => (
          <div key={f.id} className="bg-card border border-border/30 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Check className="w-5 h-5 text-emerald-400 shrink-0 hidden sm:block" />

            <div className="flex-1 w-full sm:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block sm:hidden">
                ফিচার টেক্সট ({lang === "en" ? "EN" : "বাংলা"})
              </label>
              <Input
                defaultValue={lang === "en" ? f.text_en : f.text_bn}
                key={`text-${f.id}-${lang}`}
                placeholder={lang === "en" ? "e.g. 5-minute delivery" : "যেমন: ৫ মিনিটে ডেলিভারি"}
                className="h-9 bg-secondary border-border/30 text-sm"
                onBlur={(e) => handleUpdate(f.id, lang === "en" ? "text_en" : "text_bn", e.target.value)}
              />
            </div>

            <div className="w-full sm:w-20">
              <label className="text-xs text-muted-foreground mb-1 block sm:hidden">ক্রম</label>
              <Input type="number" defaultValue={f.sort_order} className="h-9 bg-secondary border-border/30 text-sm"
                onBlur={(e) => handleUpdate(f.id, "sort_order", parseInt(e.target.value) || 0)} />
            </div>

            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => handleUpdate(f.id, "is_visible", !f.is_visible)}
                className={`p-2 rounded-lg transition ${f.is_visible ? "text-primary bg-primary/10" : "text-muted-foreground bg-secondary"}`}>
                {f.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => handleDelete(f.id)}
                className="p-2 rounded-lg text-destructive bg-destructive/10 hover:bg-destructive/20 transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {features.length === 0 && (
        <p className="text-center text-muted-foreground py-6">কোনো ফিচার নেই। উপরের বাটন দিয়ে যোগ করুন।</p>
      )}
    </div>
  );
};

export default AdminPricingFeatures;
