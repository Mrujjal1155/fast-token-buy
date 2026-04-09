import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PricingFeature {
  id: string;
  text_en: string;
  text_bn: string;
  sort_order: number;
  is_visible: boolean;
  package_key: string | null;
}

interface PackageOption {
  package_key: string;
  credits: number;
}

type EditLang = "en" | "bn";

const AdminPricingFeatures = () => {
  const [features, setFeatures] = useState<PricingFeature[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [lang, setLang] = useState<EditLang>("en");
  const [filterPkg, setFilterPkg] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    const [{ data: featData }, { data: pkgData }] = await Promise.all([
      supabase.from("pricing_features").select("*").order("sort_order"),
      supabase.from("packages").select("package_key, credits").eq("is_active", true).order("sort_order"),
    ]);
    if (featData) setFeatures(featData as PricingFeature[]);
    if (pkgData) setPackages(pkgData as PackageOption[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdate = async (id: string, field: string, value: string | number | boolean | null) => {
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
    const pkgKey = filterPkg !== "all" && filterPkg !== "global" ? filterPkg : null;
    const { data, error } = await supabase
      .from("pricing_features")
      .insert({ text_en: "New feature", text_bn: "নতুন ফিচার", sort_order: maxOrder + 1, package_key: pkgKey } as any)
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

  const filtered = filterPkg === "all"
    ? features
    : filterPkg === "global"
      ? features.filter((f) => f.package_key === null)
      : features.filter((f) => f.package_key === filterPkg);

  if (loading) return <p className="text-muted-foreground text-center py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Pricing Features</h2>
          <p className="text-sm text-muted-foreground">প্রতিটি প্ল্যানের জন্য আলাদা ফিচার সেট করুন</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Package filter */}
          <Select value={filterPkg} onValueChange={setFilterPkg}>
            <SelectTrigger className="w-[160px] h-9 bg-secondary border-border/30 text-sm">
              <SelectValue placeholder="ফিল্টার" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব ফিচার</SelectItem>
              <SelectItem value="global">🌐 গ্লোবাল (সবার জন্য)</SelectItem>
              {packages.map((p) => (
                <SelectItem key={p.package_key} value={p.package_key}>
                  📦 {p.package_key} ({p.credits} credits)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Language toggle */}
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
        {filtered.map((f) => (
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

            {/* Package assignment */}
            <div className="w-full sm:w-[140px]">
              <label className="text-xs text-muted-foreground mb-1 block sm:hidden">প্ল্যান</label>
              <Select
                value={f.package_key || "__global__"}
                onValueChange={(v) => handleUpdate(f.id, "package_key", v === "__global__" ? null : v)}
              >
                <SelectTrigger className="h-9 bg-secondary border-border/30 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__global__">🌐 সবার জন্য</SelectItem>
                  {packages.map((p) => (
                    <SelectItem key={p.package_key} value={p.package_key}>
                      {p.package_key} ({p.credits})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-6">কোনো ফিচার নেই। উপরের বাটন দিয়ে যোগ করুন।</p>
      )}
    </div>
  );
};

export default AdminPricingFeatures;
