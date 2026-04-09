import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Package, Star } from "lucide-react";
import PackageFeatures from "@/components/PackageFeatures";
import {
  buildPackageSavingsFallback,
  getPackageSavingsText,
  loadPackageTextMaps,
  savePackageTextMap,
  type LocalizedCatalogLang,
  type PackageTextMap,
} from "@/lib/catalogLocalization";

interface PackageRow {
  id: string;
  package_key: string;
  credits: number;
  price: number;
  currency: string;
  popular: boolean;
  savings: string | null;
  sort_order: number;
  is_active: boolean;
}

type PackageTextState = Record<string, Record<LocalizedCatalogLang, string>>;

const buildPackageTextPayload = (
  packageTexts: PackageTextState,
  lang: LocalizedCatalogLang
): PackageTextMap =>
  Object.fromEntries(
    Object.entries(packageTexts)
      .map(([packageKey, texts]) => [packageKey, texts[lang].trim()])
      .filter(([, savings]) => Boolean(savings))
      .map(([packageKey, savings]) => [packageKey, { savings }])
  );

const AdminPackages = () => {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [textLang, setTextLang] = useState<LocalizedCatalogLang>("en");
  const [packageTexts, setPackageTexts] = useState<PackageTextState>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPackages = async () => {
    const [{ data, error }, textMaps] = await Promise.all([
      supabase.from("packages").select("*").order("sort_order"),
      loadPackageTextMaps(),
    ]);

    if (data) {
      const packageRows = data as PackageRow[];
      setPackages(packageRows);
      setPackageTexts(
        packageRows.reduce<PackageTextState>((acc, pkg) => {
          acc[pkg.package_key] = {
            en: getPackageSavingsText(
              textMaps.en,
              pkg.package_key,
              buildPackageSavingsFallback({ value: pkg.savings, lang: "en", popular: pkg.popular })
            ),
            bn: getPackageSavingsText(
              textMaps.bn,
              pkg.package_key,
              buildPackageSavingsFallback({ value: pkg.savings, lang: "bn", popular: pkg.popular })
            ),
          };
          return acc;
        }, {})
      );
    }

    if (error) toast({ title: "লোড করতে সমস্যা", variant: "destructive" });
    setLoading(false);
  };

  useEffect(() => { fetchPackages(); }, []);

  const addPackage = async () => {
    const key = `pkg-${Date.now()}`;
    const { error } = await supabase.from("packages").insert({
      package_key: key,
      credits: 50,
      price: 40,
      currency: "BDT",
      sort_order: packages.length,
    });
    if (error) {
      toast({ title: "যোগ করা যায়নি", variant: "destructive" });
    } else {
      toast({ title: "নতুন প্যাকেজ যোগ হয়েছে", variant: "success" });
      fetchPackages();
    }
  };

  const updatePackage = async (pkg: PackageRow) => {
    try {
      const [{ error: packageError }] = await Promise.all([
        supabase
          .from("packages")
          .update({
            credits: pkg.credits,
            price: pkg.price,
            currency: pkg.currency,
            popular: pkg.popular,
            sort_order: pkg.sort_order,
            is_active: pkg.is_active,
          })
          .eq("id", pkg.id),
        Promise.all([
          savePackageTextMap("en", buildPackageTextPayload(packageTexts, "en")),
          savePackageTextMap("bn", buildPackageTextPayload(packageTexts, "bn")),
        ]),
      ]);

      if (packageError) throw packageError;
      toast({ title: "প্যাকেজ আপডেট হয়েছে", variant: "success" });
    } catch {
      toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
    }
  };

  const deletePackage = async (pkg: PackageRow) => {
    const nextPackageTexts = Object.fromEntries(
      Object.entries(packageTexts).filter(([packageKey]) => packageKey !== pkg.package_key)
    ) as PackageTextState;

    try {
      const [{ error }] = await Promise.all([
        supabase.from("packages").delete().eq("id", pkg.id),
        Promise.all([
          savePackageTextMap("en", buildPackageTextPayload(nextPackageTexts, "en")),
          savePackageTextMap("bn", buildPackageTextPayload(nextPackageTexts, "bn")),
        ]),
      ]);

      if (error) throw error;

      setPackageTexts(nextPackageTexts);
      toast({ title: "প্যাকেজ ডিলিট হয়েছে", variant: "success" });
      fetchPackages();
    } catch {
      toast({ title: "ডিলিট ব্যর্থ", variant: "destructive" });
    }
  };

  const updateField = (id: string, field: keyof PackageRow, value: any) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const updateSavingsText = (packageKey: string, lang: LocalizedCatalogLang, value: string) => {
    setPackageTexts((prev) => ({
      ...prev,
      [packageKey]: {
        en: prev[packageKey]?.en ?? "",
        bn: prev[packageKey]?.bn ?? "",
        [lang]: value,
      },
    }));
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5" /> প্যাকেজ ম্যানেজমেন্ট
          </h2>
          <p className="text-sm text-muted-foreground">ক্রেডিট প্যাকেজ যোগ, এডিট বা ডিলিট করুন</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border/30 bg-secondary p-1">
            <button
              type="button"
              onClick={() => setTextLang("en")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                textLang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setTextLang("bn")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                textLang === "bn" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              বাংলা
            </button>
          </div>
          <Button onClick={addPackage} size="sm">
            <Plus className="w-4 h-4 mr-1" /> নতুন প্যাকেজ
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-card border border-border/30 rounded-xl p-5 space-y-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">ক্রেডিট</label>
                <Input
                  type="number"
                  value={pkg.credits}
                  onChange={(e) => updateField(pkg.id, "credits", parseInt(e.target.value) || 0)}
                  className="h-9 bg-secondary border-border/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">দাম (৳)</label>
                <Input
                  type="number"
                  value={pkg.price}
                  onChange={(e) => updateField(pkg.id, "price", parseFloat(e.target.value) || 0)}
                  className="h-9 bg-secondary border-border/50"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">
                  সেভিংস টেক্সট ({textLang === "en" ? "EN" : "বাংলা"})
                </label>
                <Input
                  value={packageTexts[pkg.package_key]?.[textLang] ?? ""}
                  onChange={(e) => updateSavingsText(pkg.package_key, textLang, e.target.value)}
                  placeholder={textLang === "en" ? "e.g. 24% savings — best deal!" : "যেমন: ২৪% সাশ্রয় — সেরা ডিল!"}
                  className="h-9 bg-secondary border-border/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${pkg.popular ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm text-muted-foreground">পপুলার</span>
                  <Switch
                    checked={pkg.popular}
                    onCheckedChange={(v) => updateField(pkg.id, "popular", v)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">একটিভ</span>
                  <Switch
                    checked={pkg.is_active}
                    onCheckedChange={(v) => updateField(pkg.id, "is_active", v)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">অর্ডার</label>
                  <Input
                    type="number"
                    value={pkg.sort_order}
                    onChange={(e) => updateField(pkg.id, "sort_order", parseInt(e.target.value) || 0)}
                    className="h-8 w-16 bg-secondary border-border/50 text-center text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => updatePackage(pkg)}>
                  <Save className="w-3.5 h-3.5 mr-1" /> সেভ
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deletePackage(pkg)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <PackageFeatures packageKey={pkg.package_key} textLang={textLang as "en" | "bn"} />
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>কোনো প্যাকেজ নেই। উপরে "নতুন প্যাকেজ" ক্লিক করুন।</p>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
